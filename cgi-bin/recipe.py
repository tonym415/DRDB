#!C:\Python34\python.exe -u
"""
#!/usr/bin/python
This script provides all back-end functionality to the Digital Recipe Library
"""
import os
import cgi
import cgitb
import json
import mysql.connector
from mysql.connector import errorcode
import sys

sys.path.append('./')
import conn

cgitb.enable()
config = conn.connStr()


def cgiFieldStorageToDict(fieldStorage):
    # get a plain dictionary, rather that the '.value' system used by the
    # cgi module
    params = {}
    for key in fieldStorage.keys():
        params[key] = fieldStorage[key].value
    return params


def createItem(info):
    # create items into the database
    # dbg statement
    #sys.stderr.write("info: %s" % info['entity'])
    # always the pessimist
    returnData = {"message": "", "status": ""}
    con = None
    try:
        con = mysql.connector.connect(**config)
        cursor = con.cursor()
        cols = ""
        retcols = info['id'] + ", "
        vals = []
        sql = 'INSERT INTO %(entity)s (' % info

        # dbg statement
        #sys.stderr.write("Sql: %s" % sql)
        # get column names
        for columnInfo in info['cols']:
            #dbg statement
            sys.stderr.write("columnInfo: %s" % columnInfo)
            for key in columnInfo.keys():
                if key != 'id':
                    cols += "%s, " % key
                    retcols += "%s, " % key
                    vals.append("%s" % columnInfo[key])

        columns = cols.rstrip(', ')
        returnCols = retcols.rstrip(', ')
        values = ', '.join(vals)
        sql = sql + " %s) VALUES (%s) RETURNING %s;" % \
            (columns, values, columns)
        cursor.execute(sql)

        returnData['status'] = "success"
        returnData['message'] = "%s entered into %s" % (values, info['entity'])
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    # except psycopg2.DatabaseError, e:
    #     returnData['message'] =  "%s %s" % (cursor.query, e)
    #     sys.stderr.write("returnData: %s" % returnData)
        # returnData['status'] = "error" finally: if con:
            con.close()
    sys.stderr.write("returnData: %s" % returnData)
    return returnData


# rename items into the database
def renameItem(info):
    return {'rename': 'rename stuff'}


# update items into the database
def updateItem(info):
    return {'update': 'update stuff'}


# delete items into the database
def deleteItem(info):
    return {'delete': 'delete stuff'}


# select records from an entity
def selectItems(info):
    # dbg statement
    #sys.stderr.write("info: %s" % info['entity'])
    con = None
    try:
        returnData = {"status": 'error'}
        con = mysql.connector.connect(**config)
        cursor = con.cursor()
        sql = 'SELECT '

        # dbg statement
        #sys.stderr.write("Sql: %s" % sql)
        # get column names
        columns = ", ".join(info['cols'])
        sql = "%s %s FROM %s;" % (sql, columns, info['entity'])

        cursor.execute(sql)
        sys.stderr.write("Final Sql: %s" % cursor.query)
        retData = []
        for row in cursor.fetchall():
            sys.stderr.write("row: %s" % row)
            dicRow = {}
            for column in info['cols']:
                    dicRow[column.encode('utf8')] = "%s" % row[column]
            retData.append(dicRow)

        sys.stderr.write("Ret: %s" % retData)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    # except psycopg2.DatabaseError, e:
    #     sys.stderr.write("returnData: %s" % returnData)
    #     returnData['message'] =  "%s %s" % (returnData['message'].capitalize(), e)
    # except:
    #     exc_type, exc_obj, exc_tb  = sys.exc_info()
    #     fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    #     message = "Error: %s %s File: %s Line: %s" % (exc_type, exc_obj, fname, exc_tb.tb_lineno)
    #     data = {'status': status, 'message': message}
    finally:
        if con:
            con.close()

    returnData['status'] = "success"
    returnData['data'] = retData
    return  returnData


# based on the given data chose which function to call on the data
def doFunc(data):
    #sys.stderr.write('data: %s' % data)
    funcName = data.get('function').lower()
    if funcName == 'add':
        return createItem(data)
    elif funcName ==  'rename':
        renameItem(data)
    elif funcName == 'update':
        updateItem(data)
    elif funcName == 'delete':
        deleteItem(data)
    elif funcName == 'select':
        return selectItems(data)

# get the parameters of the POSTed data
# the cgi fieldstorage function gets the vars, the function called returns
#  a dictionary of those vars
data = cgiFieldStorageToDict(cgi.FieldStorage())

# determine how to handle the POSTed data
status = 'error'
message = "File not uploaded"
try:
    if 'imgUpload' in data.keys():
        fileItem = data['imgUpload']
        sys.stderr.write('Checking for imgupload filename: %s' % fileItem.filename)
        # test if file was uploaded
        if fileItem.filename:
           sys.stderr.write('file uploaded: %s' % fileItem.filename)
           # strip leading path from file name to avoid directory traversal attacks
           fn = os.path.basename(fileItemfilename)
           prePath = '../'
           folder = 'tmp/'
           fullFilePath = prePath + folder + fn
           if not os.path.isFile(fullFilePath):
               sys.stderr.write('writing file  %s' % fileItem.filename)
               open(fullFilePath, 'wb').write(fileItem.file.read())
               message = "%s%s" % (folder, fn)
               status = 'success'
           else:
               message = "%s%s exists already. Upload failed" % (folder, fn)
        data = {'status': status, 'message': message}
        sys.stderr.write('data after attempted write:  %s' % data)
    # use entity classes to do functions
    else:
        data = doFunc(json.loads(data['send']))
except:
   exc_type, exc_obj, exc_tb  = sys.exc_info()
   fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
   message = "Error: %s %s File: %s Line: %s" % (exc_type, exc_obj, fname, exc_tb.tb_lineno)
   data = {'status': status, 'message': message}
finally:
    # sys.stderr.write('after doFunc: %s' % data)
    # dictionary of returned data is JSONified
    if type(data) is dict:
        data = [data]
        #sys.stderr.write('wrapping []: %s' % data)
    else:
        pass
        #sys.stderr.write(' no wrapping []: %s' % data)
        #sys.stderr.write('before return: %s' % data)
    print("Content-Type: text/json;charset=utf-8\n")
    print(json.dumps(data))
