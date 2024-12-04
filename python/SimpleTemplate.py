import os, json, time, shutil
from os.path import normpath
from pathlib import Path
from fnmatch import fnmatch
from bs4 import BeautifulSoup
from FileObject import FileObject
from Template import Template
from TemplateLoader import TemplateLoader
import Dependencies


class SimpleTemplate:
    def __init__(self, config=None, configPath=None, logLevel = 0):
        self.logLevel = logLevel
        self.firstPass = True
        self.htmlFiles = []
        self.templates = []
        self.processOrder = []
        self.TemplateLoader = TemplateLoader()

        # default config options
        self.config = {
            "TEMPLATE_VAR_START": "{{",
            "TEMPLATE_VAR_END": "}}",
            "TEMPLATE_SECTION_SPLIT": "\n%\n",
            "INNER_HTML_VAR": "_inner_",
            
            "EMPTY_VAR_REPLACE": True,
            "EMPTY_VAR_VALUE": "",
            
            "INPUT_DIR": ".",
            "OUTPUT_DIR": "output",
            "TEMPLATE_DIR": ".",
            "EXCLUDE_ALL": [],
            "EXCLUDE_HTML": [],
            "EXCLUDE_TEMPLATE": [],
            "EXCLUDE_COPY": [],
            
            "OVERWRITE_ALLOWED": False
        }

        # apply zero, one, or both config options
        if configPath is not None:
            self._load_config_from_path(configPath)
        if config is not None:
            self._load_config_from_object(config)
            
        self._validateConfig()
        
    def _validateConfig(self):
        indir = Path(self.config["INPUT_DIR"])
        if not indir.exists():
            raise Exception("Input dir does not exist: " + str(indir))
        self.config["INPUT_DIR"] = indir
        
        tempdir = Path(self.config["TEMPLATE_DIR"])
        if not tempdir.exists():
            raise Exception("Template dir does not exist: " + str(tempdir))
        self.config["TEMPLATE_DIR"] = tempdir
        
        self.config["TEMPLATE_DIR"] = Path(self.config["TEMPLATE_DIR"])


    def _reset(self):
        if self.logLevel >= 4: print("_reset")
        self.htmlFiles = []
        self.templates = []
        self.processOrder = []

    ########## CONFIG ##########
    
    def _should_exclude(self, excludePatterns, fp):
        for pattern in excludePatterns:
            if fnmatch(fp, pattern):
                # print("Excluding", fp, "because of", pattern)
                return True
        return False

    def _is_html_or_template(self, fp):
        paths = [x.path for x in self.htmlFiles] + [x.path for x in self.templates]
        return any(fnmatch(fp, x) for x in paths)

    # Loads and applies a config file given a path
    def _load_config_from_path(self, path):
        if not Path(path).exists():
            return

        try:
            with open(path, "r") as file:
                config = json.load(file)
            self._load_config_from_object(config)

        except json.decoder.JSONDecodeError:
            print("Error: config file is not valid json")
            return

    # Loads and applies a config object
    def _load_config_from_object(self, config):
        for key in self.config.keys():
            if key in config:
                self.config[key] = config[key]
                
        
    ########## FILE LOADING ##########

    def _get_html_paths(self):
        if self.logLevel >= 4: print("_get_html_paths")
        fps = []
        excludePatterns = self.config["EXCLUDE_ALL"] + self.config["EXCLUDE_HTML"]
        for path in self.config["INPUT_DIR"].rglob("*.html"):
            if not self._should_exclude(excludePatterns, path):
                obj = FileObject()
                obj.path = path
                fps.append(obj)
        return fps

    def _get_template_paths(self):
        if self.logLevel >= 4: print("_get_template_paths")
        fps = []
        excludePatterns = self.config["EXCLUDE_ALL"] + self.config["EXCLUDE_TEMPLATE"]
        for path in self.config["INPUT_DIR"].rglob("*.tml"):
            if not self._should_exclude(excludePatterns, path):
                obj = FileObject()
                obj.path = path
                fps.append(obj)
        return fps

    def _load_html_files(self):
        if self.logLevel >= 4: print("_load_html_files")
        fps = self._get_html_paths()
        for obj in fps:
            try:
                with open(obj.path, "r", encoding="utf8") as file:
                    obj.content = file.read()
                self.htmlFiles.append(obj)
            except Exception as e:
                print("Error: could not read file " + obj.path)
                print(e)
        if self.logLevel >= 2: print("HTML files:", self.htmlFiles)

    def _load_templates(self):
        if self.logLevel >= 4: print("_load_templates")
        fps = self._get_template_paths()
        for obj in fps:
            try:
                with open(obj.path, "r", encoding="utf8") as file:
                    data = file.read()
                t = self.TemplateLoader.ParseTemplate(data)
                t.path = obj.path
                self.templates.append(t)
            except Exception as e:
                print("Error: could not read file " + obj.path)
                print(e)
        if self.logLevel >= 2: print("Templates:", self.templates)
    

    ########## DEPENDENCIES ##########

    def _find_html_dependencies(self):
        if self.logLevel >= 4: print("_find_html_dependencies")
        def depPop(htmlFile):
            for t in self.templates:
                # TODO probably want to make this more robust
                if "<" + t.id in htmlFile.content:
                    htmlFile.dependencies.add(t.id)
            return any(htmlFile.dependencies)
            
        self.htmlFiles[:] = [h for h in self.htmlFiles if depPop(h)]

    def _find_template_dependencies(self):
        if self.logLevel >= 4: print("_find_template_dependencies")
        for t in self.templates:
            for t2 in self.templates:
                if t.id == t2.id:
                    continue
                # TODO probably want to make this more robust
                if "<" + t2.id in t.content:
                    t.dependencies.add(t2.id)

    def _topo_sort(self):
        if self.logLevel >= 4: print("_topo_sort")
        self.processOrder = Dependencies.TopologicalSort(self.htmlFiles, self.templates)

    ########## FILLING ##########

    def _fill_template(self, template, variables):
        if self.logLevel >= 4: print("_fill_template", template.id)
        content = template.content

        for v in template.variables:
            value = None
            if v in variables:
                value = variables[v]
            elif template.defaults is not None and v in template.defaults:
                value = template.defaults[v]
            elif self.config["EMPTY_VAR_REPLACE"]:
                value = self.config["EMPTY_VAR_VALUE"]

            # replace the variable with the value if it exists
            if value is not None:
                content = content.replace(self.config["TEMPLATE_VAR_START"] + v + self.config["TEMPLATE_VAR_END"], value)

        return content

    def _fill_file(self, file):
        if self.logLevel >= 4: print("_fill_file", file)
        # TODO is there a better way to do this? possibly without using bs4?
        # TODO recursive filling
        templateIds = [t.id for t in self.templates]
        soup = BeautifulSoup(file.content, "html.parser")
        elem = soup.find()
        # iterate all elements
        while elem != None:
            nextelem = elem.findNext()
            # replace template tags with their filled content
            if elem.name in templateIds:
                t = next(t for t in self.templates if t.id == elem.name)
                elem.attrs[self.config["INNER_HTML_VAR"]] = elem.decode_contents() # set inner html to a variable
                newelem = BeautifulSoup(self._fill_template(t, elem.attrs), "html.parser")
                elem.replace_with(newelem)
            elem = nextelem

        file.content = soup.prettify(formatter="html")
        file.lastProcessed = time.time_ns()

    def _fill_all_files(self):
        if self.logLevel >= 4: print("_fill_all_files")
        for t in self.processOrder:
            item = next((x for x in self.templates if x.id == t), None)
            if not item:
                item = next((x for x in self.htmlFiles if x.path == t), None)
            self._fill_file(item)

    ########## OUTPUT ##########

    def _copy_input_directory(self):
        if self.logLevel >= 4: print("_copy_input_directory")
        excludePatterns = self.config["EXCLUDE_ALL"] + self.config["EXCLUDE_COPY"] + [str(self.config["OUTPUT_DIR"]) + "*"]
        def excludeFn(path, names):
            excluded = []
            for name in names:
                fp = Path(path) / name
                if self._should_exclude(excludePatterns, fp) or self._is_html_or_template(fp):
                    excluded.append(name)
                    # print("excluding", name)
            return excluded
        
        if self.logLevel >= 1: print("Copying input dir to output dir", self.config["INPUT_DIR"], self.config["OUTPUT_DIR"])
        shutil.copytree(self.config["INPUT_DIR"], self.config["OUTPUT_DIR"], dirs_exist_ok=True, ignore=excludeFn)


    def _copy_file(self, fp):
        if self.logLevel >= 4: print("_copy_file")
        fp = Path(fp)
        excludePatterns = self.config["EXCLUDE_ALL"] + self.config["EXCLUDE_COPY"]
        
        if not self._should_exclude(excludePatterns, fp):
            newPath = self.config["OUTPUT_DIR"] / fp.relative_to(self.config["INPUT_DIR"])
            if newPath == fp:
                print("Will not overwrite", fp)
                return
            if self.logLevel >= 2: print("Copying", fp, "to", newPath)
            shutil.copy(fp, newPath)
        

    def _output_processed_files(self):
        if self.logLevel >= 4: print("_output_processed_files")
        # os.umask(0o077) # do I need this?
        for h in self.htmlFiles:
            # set path to replace input directory with output directory
            newPath = self.config["OUTPUT_DIR"] / h.path.relative_to(self.config["INPUT_DIR"])
            # print("will write", h.path, "to", path)
            if h.path == newPath and not self.config["OVERWRITE_ALLOWED"]:
                if self.logLevel >= 2: print("Will not overwrite", h.path)
                return
            newPath.parents[0].mkdir(parents=True, exist_ok=True)
            with open(newPath, "w", encoding="utf-8") as file:
                file.write(h.content)
                
    ########## PROCESSING ##########
    
    def ProcessAll(self):
        if self.logLevel >= 1: print("Process All")
        self._reset()
        self._load_html_files()
        self._load_templates()
        self._find_template_dependencies()
        self._find_html_dependencies()
        self._topo_sort()
        self._fill_all_files()
        self._copy_input_directory()
        self._output_processed_files()
        self.firstPass = False
        
    def ProcessAfterChange(self, fileChanged):
        if self.firstPass:
            self.ProcessAll()
            return
        
        fileChanged = Path(fileChanged)
        if self.config["INPUT_DIR"] == ".":
            fileChanged = "./" + fileChanged
        
        if fileChanged in [x.path for x in self.htmlFiles]:
            print("Process HTML file change", fileChanged)
            self.ProcessAll()
            return
        
        if fileChanged in [x.path for x in self.templates]:
            print("Process template file change", fileChanged)
            self.ProcessAll()
            return
        
        self._copy_file(fileChanged)
        
