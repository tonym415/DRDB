#!/usr/bin/python

# import json to deal with return values
import json
# import modules for CGI handling
import cgi, cgitb;
import os, sys

class RecipeAgent:
	"""
	This script will be the recipe "agent". Its primary purpose will be 
	to direct all data to the appropriate functions and handle all returns
	"""
	def __init__(self):
		self.data = None

	def evaluate(self, data):
		# this function marshals the data to the appropriate helper functions
		self.data = data
		print >> sys.stderr, self.data
		return self.data


def main(argv):
	# data = cgi.FieldStorage(keep_blank_values=1)
	# print >> sys.stderr, "Data: %s" %  data 	
	data = {"function":"select","entity":"ingredient_descriptors","cols":["ingredient_descriptor_id","descriptor_text"]}

	# instantiate a Recipe Agent
	rAgent = RecipeAgent()	
	# evaluate given data
	retData = rAgent.evaluate(data)


	print "Content-type:text/html\r\n\r\n"
	print json.dumps(retData)

if __name__ == "__main__":
	main(sys.argv[1:])

