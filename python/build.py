import sys
import time
import logging
import argparse
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler, FileSystemEventHandler
from SimpleTemplate import SimpleTemplate

# templates = {}

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
        
        st.ProcessAfterChange(event.src_path)
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("config", type=str, nargs="?", default="tml_config_dev.json", help="path to the TML config file")
    parser.add_argument("-w", "--watch", action="store_true", default=False, help="continuously process changes to input directory")
    parser.add_argument("-v", "--verbose", action="count", default=0, help="increase output logs (max 3 levels -vvv)")
    args = parser.parse_args()
    
    if (args.verbose > 0):
        print("config path:", args.config)
        
    st = SimpleTemplate(configPath=args.config, logLevel=args.verbose)
    print(st.config["INPUT_DIR"], "-->", st.config["OUTPUT_DIR"])
    st.ProcessAll()
    
    if not args.watch:
        sys.exit()
    
    event_handler = SimpleTemplateHandler()
    observer = Observer()
    observer.schedule(event_handler, st.config["INPUT_DIR"], recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except Exception:
        observer.stop()
    observer.join()
