#!C:\Python34\python.exe -u
import cgi
# import sys
import json
import cgitb

cgitb.enable()


def sendHeaders():
    print("Content-Type: text/html\n\n")


def setParams(fs):
    sendHeaders()
    print("<p> %s </p" % fs.getvalue('function'))


# this will eventually be a database call
def loadCategoryQuestions(category):
    returnVals = []
    returnObj = {}
    returnObj[category] = {}
    for x in range(1, 9):
        returnObj[category]["q%s" % x] = "%s question %d" % (category, x)

    returnVals.append(returnObj)
    sendHeaders()
    print(json.dumps(returnVals))


def getFunc(fStor):
    funcName = fStor.getvalue('function')
    return {
       "loadCategoryQuestions" : ("%s('%s')" % 
           (funcName, fStor.getvalue('category')))
    }.get(funcName,"")   


fs = cgi.FieldStorage()
if 'function' in fs.keys():
    # decide which function to run
    func = getFunc(fs)
    eval(func)
