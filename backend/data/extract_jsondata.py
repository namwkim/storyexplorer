import sys, csv, re
import json
# import io
from bson import json_util, ObjectId
from pymongo import MongoClient

if __name__ == "__main__":

    # open db connection
    dbauth = csv.reader(open('dbauth.txt', 'r')).next()
    dbauth[0] = dbauth[0].strip()
    dbauth[1] = dbauth[1].strip()

    dburl = 'mongodb://' + \
        dbauth[0] + ':' + dbauth[1] + \
            '@localhost:27017/?authSource=admin'

    client = MongoClient(dburl)
    db = client.nolitory

    titles =  list(db.scripts.find({}, {'title':1}))
    for i, title in enumerate(titles):
        title['_id'] = str(title['_id'])
        print str(i + 1) + '. ' + title['title']



    # #   select a movie title
    # scripts = []
    # for script in db.scripts.find():
    #     scripts.append(script)

    # for i, script in enumerate(scripts):
    #     print str(i + 1) + '. ' + script['title']

    mIdx = raw_input("Select a Movie (Enter number)")
    try:
        mIdx = int(mIdx) - 1
        if mIdx < 0 or mIdx >= len(titles):
            print 'Wrong Selection.'
            sys.exit(0)
    except ValueError:
        # Handle the exception
        print 'Please enter an integer!'
        sys.exit(0)

    simplified = raw_input("Do you need smaller simplified data (yes or no)?")

    selected = titles[mIdx]
    print 'Parsing ', selected['title']


    # save into files
    filename = selected['title'].encode('ascii','ignore').lower()
    filename = re.sub(r"\s+", "_", filename)
    filename = filename.replace(',_the', '') # for usual suspects

    if (simplified.lower()=='yes' or simplified.lower()=='y'):
        script_metadata =  db.script_metadata.find_one({"script_id": ObjectId(selected['_id'])})

        # delete unnecessary properties
        del script_metadata['script_id']
        del script_metadata['_id']
        if 'character_metadata' in script_metadata:
            del script_metadata['character_metadata']
        for scene in script_metadata['scenes']:
            del scene['conversations']
            del scene['character_metadata']
            del scene['heading']
            del scene['actions']
        # print filename
        with open('json/'+filename+'_simple.json', 'w') as outfile:
            # data = json.dumps(scenes, indent=True)
            data = json_util.dumps({\
                'script_info':script_metadata \
            }, separators=(',', ': '))
            outfile.write(data)
    else:
        script_metadata =  db.script_metadata.find_one({"script_id": ObjectId(selected['_id'])})
        tmdb_metadata   =  db.tmdb_metadata.find_one({"script_id": ObjectId(selected['_id'])})
        # delete unnecessary properties
        del tmdb_metadata['script_id']
        del tmdb_metadata['_id']
        del script_metadata['script_id']
        del script_metadata['_id']
        if 'character_metadata' in script_metadata:
            del script_metadata['character_metadata']

        # print filename
        with open('json/'+filename+'.json', 'w') as outfile:
            # data = json.dumps(scenes, indent=True)
            data = json_util.dumps({\
                'movie_info':tmdb_metadata, \
                'script_info':script_metadata \
            }, indent = 4)
            outfile.write(data)
    # scenes = script_metadata['scenes']
    # print '# of scenes', len(scenes)
    # output = []
    # for scene in scenes:
    #     metadata = scene['scene_metadata']
    #     print scene['story_order'], ',', len(scene['characters']), ',', scene['narrative_order'], ':', metadata['location'], ',', metadata['time']
    #     output.push({
    #         'story_order':scene['story_order'],
    #         'narrative_order':scene['narrative_order'],
    #         'location':metadata['location'],
    #         'metadata2':metadata['time'],
    #         'children':
    #
    #
    #     })
