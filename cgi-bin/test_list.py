#!/usr/bin/python
import glob
import json

# base directory
d = "c:\\wamp\\www\\DRDB\\"

# get listing of all html files in public_html
dirlist = glob.glob(d + "*.html")

# create dictionary of file names to display
dList = ({"name": x[len(d):]} for x in dirlist)

# print to web
print("Content-type: text/html;charset=utf-8\n")
print(json.dumps(list(dList)))
