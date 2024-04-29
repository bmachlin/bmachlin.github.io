import os, json, time, shutil, sys
from os.path import normpath
from fnmatch import fnmatch
from bs4 import BeautifulSoup
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler, FileSystemEventHandler

# class to hold the data for a file
class FileObject:
    def __init__(self):
        self.path = ""
        self.content = ""
        self.dependencies = set()
        self.lastProcessed = 0 # time in ns since epoch
        
    def __str__(self):
        return "FileObject: " + self.path
    
    def __repr__(self):
        return self.__str__()

# class to hold the data for a TML template
class Template(FileObject):
    def __init__(self):
        super(Template, self).__init__()
        self.defaults = {}
        self.variables = []
        self.id = "" # how the template will be referenced in the HTML files, e.g. <id></id>
    
    def __str__(self):
        return "Template: " + self.id + " " + self.path
    
    def __repr__(self):
        return self.__str__()
    

# return a dependency graph in the form of:
# graph[a] = [b,c] where a depends on b and c
def BuildGraph():
    dependsOn = {}
    for h in htmlFiles:
        dependsOn[h.path] = h.dependencies
    for t in templates:
        dependsOn[t.id] = t.dependencies
    return dependsOn

# https://www.geeksforgeeks.org/topological-sorting-indegree-based-solution/
# return a topological sort of the graph, from least dependent to most
def TopologicalSort():
    graph = BuildGraph()
    
    indegree = {v: 0 for v in graph.keys()}
    for i in graph:
        for j in graph[i]:
            indegree[j] += 1

    queue = [v for v in graph.keys() if indegree[v] == 0]
    visitedVertices = []
    topOrder = []

    while queue:
        # dequeue and add a vertex to the topological order
        v = queue.pop(0)
        topOrder.insert(0,v)

        # Iterate neighboring vertices of dequeued vertex and decrease their in-degrees by 1
        # I.e. remove it from the graph
        for d in graph[v]:
            indegree[d] -= 1
            # If in-degree becomes zero, add it to queue
            if indegree[d] == 0:
                queue.append(d)

        visitedVertices.append(v)

    if len(visitedVertices) != len(graph):
        # print("There exists a cycle in the graph", len(visitedVertices), len(graph))
        raise Exception("Cycle in graph")
    
    return topOrder
    

TEMPLATE_SECTION_SPLIT = "\n%\n"
TEMPLATE_VAR_START = "{{"
TEMPLATE_VAR_END = "}}"
INNER_HTML_VAR = "_inner_"    

# parse template object from file data
def ParseTemplate(data):
    template = Template()
    parts = data.split(TEMPLATE_SECTION_SPLIT, maxsplit=2)
    
    template.id = parts[0].strip()
    
    # 3 parts means id -> defaults -> content
    # 2 parts means id -> content
    if len(parts) >= 3:
        template.defaults = ParseTemplateDefaults(parts[1])
        template.content = parts[2]
    else:
        template.content = parts[1]
        
    template.variables = ParseTemplateVars(template.content)
    
    return template


# defaults specified one on each line with = separator
def ParseTemplateDefaults(data):
    defaults = {}
    
    # split defaults by newline
    for line in data.split("\n"):
        # split default name and value by '='
        parts = line.split("=", 1)
        if len(parts) == 2:
            defaults[parts[0].strip()] = parts[1].strip()
            
    return defaults


# find all the {{variables}} in the template
def ParseTemplateVars(templateString):
    variables = []
    
    for i in range(len(templateString)):
        # find the start of a variable
        if templateString[i:i+len(TEMPLATE_VAR_START)] == TEMPLATE_VAR_START:
            start = i
            # find the end of the variable
            end = templateString.find(TEMPLATE_VAR_END, start) + len(TEMPLATE_VAR_END)
            # add the variable to the list sans variable syntax
            variables.append(templateString[start + len(TEMPLATE_VAR_START) : end - len(TEMPLATE_VAR_END)])
            
    return variables


def FindDependencies(template, allTemplates):
    dependencies = set()
    soup = BeautifulSoup(template.content, 'html.parser')
    templateIds = [t.id for t in allTemplates]
    elem = soup.find()
    
    while elem != None:
        nextelem = elem.findNext()
        if elem.name in templateIds:
            dependencies.add(elem.name)
        elem = nextelem
        
    return dependencies
    
def FillTemplate(template, variables):
    html = template.content
    
    for v in template.variables:
        if v in variables:
            html = html.replace(TEMPLATE_VAR_START + v + TEMPLATE_VAR_END, variables[v])
        else:
            html = html.replace(TEMPLATE_VAR_START + v + TEMPLATE_VAR_END, template.defaults[v])
            
    return html


firstPass = True
htmlFiles = []
templates = []

# default config options
config = {
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
    "OVERWRITE_ALLOWED": False,
}

########## CONFIG ##########

def ShouldExclude(excludePatterns, fp):
    for pattern in excludePatterns:
        if fnmatch(fp, pattern):
            # print("Excluding", fp, "because of", pattern)
            return True
    return False

def IsHtmlOrTemplate(fp):
    paths = [x.path for x in htmlFiles] + [x.path for x in templates]
    return any(fnmatch(fp, x) for x in paths)

# Load and apply a config file given a path
def LoadConfigFromPath(path):
    if not os.path.isfile(path):
        print("Could not find config file at", path)
        return

    with open(path, "r") as file:
        config = json.load(file)
    LoadConfig(config)

# Loads and applies a config object
def LoadConfig(configObj):
    for key in configObj.keys():
        if key in configObj:
            print("Setting", key, "to", repr(configObj[key]))
            config[key] = configObj[key]
    

########## FILE LOADING ##########

def GetHtmlFilePaths():
    fps = []
    excludePatters = config["EXCLUDE_ALL"] + config["EXCLUDE_HTML"]
    for root, dirs, files in os.walk(config["INPUT_DIR"]):
        for file in files:
            fp = normpath(os.path.join(root, file))
            if normpath(config["INPUT_DIR"]) == ".":
                fp = "./" + fp
            if file.endswith(".html") and not ShouldExclude(excludePatters, fp):
                obj = FileObject()
                obj.path = fp
                fps.append(obj)
    return fps

def GetTemplateFilePaths():
    fps = []
    excludePatters = config["EXCLUDE_ALL"] + config["EXCLUDE_TEMPLATE"]
    for root, dirs, files in os.walk(config["TEMPLATE_DIR"]):
        for file in files:
            fp = normpath(os.path.join(root, file))
            if file.endswith(".tml") and not ShouldExclude(excludePatters, fp):
                obj = Template()
                obj.path = fp
                fps.append(obj)
    return fps

def LoadHtmlFiles():
    global htmlFiles
    htmlFiles = []
    fps = GetHtmlFilePaths()
    for obj in fps:
        try:
            with open(obj.path, "r", encoding="utf8") as file:
                obj.content = file.read()
            htmlFiles.append(obj)
        except Exception as e:
            print("Error: could not read file " + obj.path)
            print(e)

def LoadTemplates():
    global templates
    templates = []
    fps = GetTemplateFilePaths()
    for obj in fps:
        try:
            with open(obj.path, "r", encoding="utf8") as file:
                data = file.read()
            t = ParseTemplate(data)
            t.path = obj.path
            templates.append(t)
        except Exception as e:
            print("Error: could not read file " + obj.path)
            print(e)

########## DEPENDENCIES ##########

def FindHtmlDependencies():
    for h in htmlFiles:
        for t in templates:
            # TODO probably want to make this more robust
            if "<" + t.id in h.content:
                h.dependencies.add(t.id)

def FindTemplateDependencies():
    for t in templates:
        for t2 in templates:
            if t.id == t2.id:
                continue
            # TODO probably want to make this more robust
            if "<" + t2.id in t.content:
                t.dependencies.add(t2.id)


########## FILLING ##########

def FillTemplate(template, variables):
    content = template.content

    for v in template.variables:
        value = None
        if v in variables:
            value = variables[v]
        elif template.defaults is not None and v in template.defaults:
            value = template.defaults[v]
        elif config["EMPTY_VAR_REPLACE"]:
            value = config["EMPTY_VAR_VALUE"]

        # replace the variable with the value if it exists
        if value is not None:
            content = content.replace(config["TEMPLATE_VAR_START"] + v + config["TEMPLATE_VAR_END"], value)

    return content

def FillFile(file):
    # TODO is there a better way to do this? possibly without using bs4?
    # TODO recursive filling
    templateIds = [t.id for t in templates]
    soup = BeautifulSoup(file.content, "html.parser")
    elem = soup.find()
    # iterate all elements
    while elem != None:
        nextelem = elem.findNext()
        # replace template tags with their filled content
        if elem.name in templateIds:
            t = next(t for t in templates if t.id == elem.name)
            elem.attrs[config["INNER_HTML_VAR"]] = elem.decode_contents() # set inner html to a variable
            newelem = BeautifulSoup(FillTemplate(t, elem.attrs), "html.parser")
            elem.replace_with(newelem)
        elem = nextelem

    file.content = soup.prettify(formatter="html")
    file.lastProcessed = time.time_ns()

def FillAllFiles():
    for t in TopologicalSort():
        item = next((x for x in templates if x.id == t), None)
        if not item:
            item = next((x for x in htmlFiles if x.path == t), None)
        FillFile(item)

########## OUTPUT ##########

def CopyInputDirectory():
    excludePatterns = config["EXCLUDE_ALL"] + config["EXCLUDE_COPY"] + [config["OUTPUT_DIR"] + "/*"]
    def excludeFn(path, names):
        excluded = []
        for name in names:
            fp = os.path.join(normpath(path), name)
            if os.path.isdir(fp):
                fp += "/"
            if ShouldExclude(excludePatterns, fp) or IsHtmlOrTemplate(fp):
                excluded.append(name)
        return excluded
    
    shutil.copytree(config["INPUT_DIR"], config["OUTPUT_DIR"], dirs_exist_ok=True, ignore=excludeFn)


def CopyFile(fp):
    excludePatterns = config["EXCLUDE_ALL"] + config["EXCLUDE_COPY"]
    if not ShouldExclude(excludePatterns, fp):
        if config["INPUT_DIR"] == ".":
            fp = "./" + fp
        newFp = fp.replace(normpath(config["INPUT_DIR"]), normpath(config["OUTPUT_DIR"]), 1)
        if newFp == fp:
            print("Will not overwrite", fp, config["INPUT_DIR"], config["OUTPUT_DIR"])
            return
        print("Copying", fp, "to", newFp)
        shutil.copy(fp, newFp)
    

def OutputProcessedFiles():
    # print("Outputting processed files to", outputRoot)
    for h in htmlFiles:
        # skip outputting files that have no dependencies, i.e. were not changed
        if not h.dependencies:
            continue
        # set path to replace input directory with output directory
        path = h.path.replace(normpath(config["INPUT_DIR"]), normpath(config["OUTPUT_DIR"]), 1)
        # print("will write", h.path, "to", path)
        if h.path == path and not config["OVERWRITE_ALLOWED"]:
            print("Will not overwrite", h.path)
            return
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as file:
            file.write(h.content)
            
########## PROCESSING ##########

def ProcessAll():
    print("GO")
    LoadHtmlFiles()
    LoadTemplates()
    FindTemplateDependencies()
    FindHtmlDependencies()
    TopologicalSort()
    FillAllFiles()
    CopyInputDirectory()
    OutputProcessedFiles()
    firstPass = False
    print("DONE")
    
def ProcessAfterChange(fileChanged):
    if firstPass:
        ProcessAll()
        return
    
    fileChanged = normpath(fileChanged)
    if config["INPUT_DIR"] == ".":
        fileChanged = "./" + fileChanged
    
    if fileChanged in [x.path for x in htmlFiles]:
        ProcessAll()
        return
    
    if fileChanged in [x.path for x in templates]:
        ProcessAll()
        return
    
    CopyFile(fileChanged)
 
   
class SimpleTemplateHandler(FileSystemEventHandler):
    def __init__(self):
        super(SimpleTemplateHandler, self).__init__()
        self.last_trigger_time = time.time()
        
    def on_any_event(self, event):
        current_time = time.time()
        if event.is_directory or (current_time - self.last_trigger_time) < 1:
            return
        self.last_trigger_time = current_time
        print("\n\n", event.event_type, "event for", event.src_path)
        
        ProcessAfterChange(event.src_path)
    

if __name__ == "__main__":
    path = "."
    configPath = "./tml_config.json" # default config file to use
    if len(sys.argv) > 1:
        configPath = sys.argv[1]
        
    watch = len(sys.argv) > 2 and "watch" in sys.argv[2].lower()
    
    print("config path", configPath)
    LoadConfigFromPath(configPath)
    print("input dir", config["INPUT_DIR"])
    print("output dir", config["OUTPUT_DIR"])
    ProcessAll()
    
    if not watch:
        sys.exit()
    path = config["INPUT_DIR"]
    
    event_handler = SimpleTemplateHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
