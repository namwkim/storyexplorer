import sys
import os
from flask import Flask, render_template, request, send_from_directory, jsonify, logging
# from flask.ext.socketio import SocketIO
from werkzeug import secure_filename
from logging.handlers import RotatingFileHandler
from pymongo import MongoClient
from bson import json_util, ObjectId
from data import metadata
import csv
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# read a keyfile
with open('./backend/data/moviedb_apikey.txt', 'r') as f:
    TMDB_KEY= f.readline().rstrip('\r\n')

# from bson.objectid import objectid
app = Flask(__name__, template_folder="../frontend/dist",
            static_folder="../frontend/dist",
            static_url_path="")
# app.config.from_object('config')
# app.config.from_pyfile('config.py')
app.config.update(dict(
    CLIENT_FOLDER='../frontend/dist',
    DEBUG=True,  # Turns on debugging features in Flask
    DEV_PORT=1709,
    PRD_PORT=1710,
    TMDB_KEY=TMDB_KEY
    # BCRYPT_LEVEL = 12 # Configuration for the Flask-Bcrypt extension
    # SECRET_KEY = xxx #  should define this in your instance folder
))

# socketio = SocketIO(app)
# logging into a file for production
# handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
# handler.setLevel(logging.INFO)
# app.logger.addHandler(handler)

# db authentication
dbauth = csv.reader(open('./backend/data/dbauth.txt', 'r')).next()
dbauth[0] = dbauth[0].strip()
dbauth[1] = dbauth[1].strip()

dburl = 'mongodb://'+dbauth[0]+':'+dbauth[1]+'@localhost:27017/?authSource=admin'

client  = MongoClient(dburl)
db      = client.nolitory

# use creds to create a client to interact with the Google Drive API
scope = ['https://spreadsheets.google.com/feeds']

# Find a workbook by name and open the first sheet
# Make sure you use the right name here.



## ------------------ route ------------------------------------ ##


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    # app.logger.info('You want path: %s' % path)
    return render_template("index.html")

# HACK: Use socketio
@app.route('/titles', methods=['GET'])
def get_titles():
    titles =  list(db.scripts.find({}, {'title':1}))
    if titles is None or len(titles)==0:
        return jsonify(msg="No data found", code = 1)
    app.logger.info("titles successfully received:"+str(len(titles)))
    for title in titles:
        title['_id'] = str(title['_id'])
    return jsonify(code=0, titles=titles)

@app.route('/script', methods=['GET'])
def get_script():
    id = request.args['id']
    data =  db.scripts.find_one({"_id": ObjectId(id)})
    if data is None:
        return jsonify(id="", title="No data found", segments=[])
    app.logger.info("successfully received")
    return jsonify(id=str(data["_id"]), title = data["title"], segments = data["segments"])

@app.route('/metadata', methods=['GET'])
def get_metadata():
    id = request.args['id']
    if request.args.has_key('force'):
        force = request.args['force']
    else:
        force = None
    tmdb_metadata =  db.tmdb_metadata.find_one({"script_id": ObjectId(id)})
    script_metadata =  db.script_metadata.find_one({"script_id": ObjectId(id)})
    if tmdb_metadata is None or force=='MovieMetadata':
        app.logger.info("Deriving tmdb_metadata...")
        tmdb_metadata = metadata.update_tmdb_metadata(db, app.config['TMDB_KEY'], ObjectId(id))

    if script_metadata is None or force=='ScriptMetadata':
        app.logger.info("Deriving script_metadata...")
        script_metadata = metadata.update_script_metadata(db, ObjectId(id))

    return jsonify(json.loads(\
        json_util.dumps({'tmdb_metadata':tmdb_metadata, 'script_metadata':script_metadata})))

@app.route('/update_story_order', methods=['POST'])
def update_story_order():
    id      = request.form['id']
    scenes  = json.loads(request.form['scenes'])
    app.logger.info(request.form['id'])
    retobj =  db.script_metadata.update_one({"_id": ObjectId(id)}, {"$set":{"scenes": scenes }})
    # app.logger.info(retobj.modified_count)
    return jsonify(matched_count=retobj.matched_count, modified_count=retobj.modified_count)

@app.route('/save_user_session', methods=['POST'])
def save_user_session():
    result  = json.loads(request.form['result'])
    app.logger.info(result[0])

    creds = ServiceAccountCredentials.from_json_keyfile_name('./backend/data/gdrive_auth.json', scope)
    gclient = gspread.authorize(creds)
    sheet = gclient.open_by_key("1PPVaCuqFB1-lhNfX9fBkHldts9XhVtSoFuFsVRO3Pm0").sheet1
    sheet.insert_row(result)

    app.logger.info('saving user drawing')
    with open('./backend/uploads/'+result[0]+'.svg', 'w') as file:
        file.write(result[-1])

    return jsonify(code=0, message='user_session_saved')

@app.route('/load_user_session', methods=['GET'])
def load_user_session():
    userID = request.args.get('id')
    creds = ServiceAccountCredentials.from_json_keyfile_name('./backend/data/gdrive_auth.json', scope)
    gclient = gspread.authorize(creds)
    sheet = gclient.open_by_key("1PPVaCuqFB1-lhNfX9fBkHldts9XhVtSoFuFsVRO3Pm0").sheet1
    cell = sheet.find(userID)
    result = sheet.row_values(cell.row)
    # app.logger.info(userID)
    # app.logger.info(result)
    return jsonify(code=0, result=result)

@app.route('/save_post_survey', methods=['POST'])
def save_post_survey():
    result  = json.loads(request.form['result'])
    app.logger.info(result)

    creds = ServiceAccountCredentials.from_json_keyfile_name('./backend/data/gdrive_auth.json', scope)
    gclient = gspread.authorize(creds)
    sheet = gclient.open_by_key("1Y5vsttRp3Srcx3TyPnLxCpyJrqX4dE5SWgZn4ZmlxwU").sheet1
    sheet.insert_row(result)

    return jsonify(code=0, message='post_survey_saved')


@app.route('/update_segment', methods=['POST'])
def post_segment():
    id      = request.form['id']
    segID   = request.form['segID']
    app.logger.info(request.form)
    if request.form.has_key("tag"):
        tag         = request.form['tag']
        setProperty = {"segments.$.tag": tag }
    elif request.form.has_key("storyOrder"):
        storyOrder  = request.form['storyOrder']
        setProperty = {"segments.$.storyOrder": int(storyOrder) }
    elif request.form.has_key("content"):
        content         = request.form['content']
        setProperty = {"segments.$.content": content }
    retobj =  db.scripts.update_one({"_id": ObjectId(id), "segments.segID": int(segID)}, {"$set":setProperty})
    # app.logger.info(retobj.modified_count)
    return jsonify(matched_count=retobj.matched_count, modified_count=retobj.modified_count)


## start the server
if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == "-production":
        port = app.config["PRD_PORT"]
    else:
        port = app.config["DEV_PORT"]
    app.run(debug=app.config["DEBUG"], host='0.0.0.0', port=port, threaded=True)

# This is required by zone.js as it need to access the
# "main.js" file in the "ClientApp\app" folder which it
# does by accessing "<your-site-path>/app/main.js"
# @app.route('/app/<path:filename>')
# def client_app_folder(filename):
# return send_from_directory(os.path.join(app.config['CLIENT_FOLDER'],
# "app"), filename)

# Custom static data
# @app.route('/assets/<path:filename>')
# def client_assets_folder(filename):
# return send_from_directory(os.path.join(app.config['CLIENT_FOLDER'],
# "assets"), filename)

# @app.route('/node_modules/<path:filename>')
# def client_node_modules_folder(filename):
# return send_from_directory(os.path.join(app.config['CLIENT_FOLDER'],
# "node_modules"), filename)

# @app.route('/<path:filename>')
# def client_folder(filename):
#     app.logger.info("file request")
#     return send_from_directory("../frontend/dist", filename)


#from server import app, socketio
# from flask import request
# @socketio.on('connect', namespace='/main')
# def connected():
#     ip = request.remote_addr
#     app.logger.info("<<<<<<<<< socketio connected ("+ip+") >>>>>>>>>>")
#     emit('my response', {'data': 'Connected'})
#
#
# @socketio.on('disconnect', namespace='/test')
# def disconnected():
#     app.logger.info('Client disconnected')

## ------------------ route ------------------------------------ ##
