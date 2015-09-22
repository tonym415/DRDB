#!/usr/bin/python
# -*- coding: utf-8 -*-

import psycopg2
import sys

class DB_Tester:
    'Class to run certain test on the database'
    def __init__(self,connection_string, test_string=""):
        self.con = None
        self.test_string = test_string 
        self.con_str =  connection_string 

    def setTestString(self,test_string):
        self.test_string = test_string

    def getTestString(self):
        return self.test_string

    def selectTest(self):
        print "\nSelection Test\n==============\n"
        try:
            self.con = psycopg2.connect(self.con_str)
            cur = self.con.cursor()
            cur.execute(self.getTestString())
            for row in cur.fetchall():
                print '%s: %s' % (row[0], row[1])

        except psycopg2.DatabaseError, e:
            print 'Error %s' % e
            sys.exit(1)

        finally:
            if self.con:
                self.con.close()


    def dropAll(self):
        #Drop all tables from a given database

        try:
            conn = psycopg2.connect(self.con_str)
            conn.set_isolation_level(0)
        except:
            print "Unable to connect to the database."

        cur = conn.cursor()

        try:
            cur.execute("SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema,table_name")
            rows = cur.fetchall()
            for row in rows:
                print "dropping table: ", row[1]   
                cur.execute("drop table " + row[1] + " cascade") 

            cur.close()
            conn.close()        
        except:
            print "Error: ", sys.exc_info()[1]

if __name__ == '__main__':
    strConn = "host='localhost' dbname='recipe' user='www-data' password='wwwdata'"
    str1 = "SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema,table_name"  
    str2 = 'select category_id, category_name from categories;'
    str3 = 'select ingredient_id, ingredient_name from ingredients;'

    # create new tester with conn string
    dbt = DB_Tester(strConn)
    dbt.setTestString(str1)
    dbt.selectTest()
    dbt.setTestString(str3)
    dbt.selectTest()
