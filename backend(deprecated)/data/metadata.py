import sys
import os
import re
from pymongo import MongoClient
import tmdbsimple as tmdb
from textblob import TextBlob
from igraph import *

SCENE_HEADING = "Scene Heading"
ACTION = "Action"
CHARACTER_NAME = "Character Name"
DIALOGUE = "Dialogue"
PARENTHETICAL = "Parenthetical"
IGNORE = "Ignore"

def get_loctime(heading):
    #   remove numbers and special characters except space, dot, hyphen
    heading = re.sub(r'[^a-zA-Z\'\.\s\-\/]', '',heading).strip()
    if heading.endswith('-'):
        heading = heading[:-1]
    if ('EXT.' in heading and 'INT.' in heading) or \
        ('EXT ' in heading and 'INT ' in heading):
        setting='EXT./INT.'
    elif 'EXT.' in heading or 'EXT ' in heading:

        setting='EXT.'
    elif 'INT.' in heading or 'INT ' in heading:
        setting='INT.'
    else:
        setting=None

    loc  = None
    time = None
    # Location & Time
    if setting!=None:
        splitted = heading.split(setting)
        setting=setting.title()
        if len(splitted)>1:
            loctime = splitted[1].split('-')
            if len(loctime)>1:
                loc = '-'.join(loctime[:-1]).strip().title()
                time = loctime[-1].strip().title()
            else:
                loc = loctime[0].strip().title()
                time = None
    else:
        setting=heading.title()

    #
    #     #remove EXT/INT&dot
    #     heading.replace('INT ')
    #     heading = re.sub(r'[^a-zA-Z\s\-]', '',heading).strip()
    #     loctime = splitted[1].split('-')
    #     if
    #         setting='Exterior'
    #     elif :
    #         setting='Interior'
    #     else:
    #         setting='Unknown'
    #
    #
    # splitted = splitted.
    #
    # print (setting, loc, time)
    return (setting, loc, time)
def get_character_name(text):
    no_paren = re.sub(r'\([^)]*\)', '', text) # exclude parenthetical
    no_special = re.sub(r'[^A-Za-z0-9\'\s\.]+', '', no_paren) #remove special characters except space
    # other rules here
    name = no_special.replace("'S VOICE", '')
    return name.strip().title()

def get_script_metadata(script):
    print 'extracting metadata from', script['title']
    segments = script['segments']
    # print segments

    # merge consecutive segments of same tag ==============================
    prev_seg = None
    cluster = None
    clusters = []
    order = 0
    for i, seg in enumerate(segments):
        if seg['tag']==IGNORE:
            continue
        if prev_seg is not None and prev_seg['tag']==seg['tag']:
            if seg['tag']==CHARACTER_NAME:
                print 'CHARACTER NAME STRANGE', seg['content'], prev_seg['content'], i
                continue
            cluster['content'] += seg['content']
        else:
            # print seg['tag']
            order +=1
            cluster = {}
            cluster['tag']= seg['tag']
            cluster['content'] = seg['content']
            cluster['order'] = order
            clusters.append(cluster)
        prev_seg = seg

    # group by scene ======================================================
    scenes = []
    prev_seg = None
    for seg in clusters:
        if seg['tag']==SCENE_HEADING:
            scene = {}
            scene['heading'] = seg['content']
            scene['characters'] =  [] # contains unique character names
            scene['conversations'] = []
            scene['actions'] = []
            order = 0 # order of presentation of conversations and actions
            scenes.append(scene)
        if seg['tag']==CHARACTER_NAME:
            name = get_character_name(seg['content'])
            if name not in scene['characters']:
                scene['characters'].append(name)

            # character's dialogue
            dialogue = []
            scene['conversations'].append({
                'character':name,
                'dialogue':dialogue,
                'order': order
            })
            order+=1
        if seg['tag']==DIALOGUE:
            dialogue.append({
                'type': DIALOGUE,
                'content': seg['content']
            })
        if seg['tag']==PARENTHETICAL:
            dialogue.append({
                'type': PARENTHETICAL,
                'content': seg['content']
            })
        if seg['tag']==ACTION:
            scene['actions'].append({
                'order':order,
                'content':seg['content']
            })
            order+=1
        prev_tag = seg

    # basic script metadata ================================================
    # movie level
    names = []
    for scene in scenes:
        for character in scene['characters']:
            if character not in names:
                names.append(character)
    # construct a character network
    g = Graph()
    g.add_vertices(len(names))
    g.vs["name"] = names
    # scene metadata
    overall_verbosity = dict.fromkeys(names, 0)
    whole_dialogue = dict.fromkeys(names, '')
    # overall_emotion = dict.fromkeys(names)
    for scene in scenes:
        whole_scene_text = ''
        # add edges to the character graph
        for c1 in scene['characters']:
            for c2 in scene['characters']:
                if c1==c2:
                    continue
                n1 = names.index(c1)
                n2 = names.index(c2)
                # print (n1,n2)
                g.add_edge(n1,n2, weight=1)

        # character metadata: verbosity & sentiment
        character_metadata = []
        for character in scene['characters']:
            verbosity = 0
            sentiment = None
            all_text = ''
            for conv in scene['conversations']:

                if conv['character']==character:
                    for dialogue in conv['dialogue']:
                        # if dialogue['type']==PARENTHETICAL:
                        if dialogue['type']==DIALOGUE:
                            verbosity += len(dialogue['content'])
                        all_text += dialogue['content']

            blob = TextBlob(all_text)
            sentiment = blob.sentiment.polarity
            whole_dialogue[character]+=all_text
            overall_verbosity[character]+=verbosity

            character_metadata.append({
                'name':character,
                'verbosity':verbosity,
                'sentiment':sentiment
            })

            whole_scene_text+=all_text

        for action in scene['actions']:
            whole_scene_text += action['content']

        # scene metadata: setting & location & time, sentiment
        scene_metadata = {}
        loctime = get_loctime(scene['heading'])
        blob = TextBlob(whole_scene_text)
        sentiment = blob.sentiment.polarity

        scene_metadata['setting'] = loctime[0]
        scene_metadata['location'] = loctime[1]
        scene_metadata['time'] = loctime[2]
        scene_metadata['size'] = len(whole_scene_text)
        scene_metadata['sentiment'] = sentiment
        scene['character_metadata'] = character_metadata
        scene['scene_metadata'] = scene_metadata

    g.simplify(combine_edges=dict(weight="sum"))# multiple edges into weights
    # for edge in g.get_edgelist():
    #     print g.vs["name"][edge[0]], g.vs["name"][edge[1]]
    # print g.get_adjacency(attribute="weight")
    clusters = g.community_edge_betweenness(directed=False, weights="weight")
    # print clusters.as_clustering()
    #print network
    # print '===== Character Network ====='
    characters = []
    for character in names:
        node = names.index(character)
        # print character
        # print '-degree:', g.degree(node)
        # print '-betweenness', g.betweenness(node)
        whole_dialogue[character]
        blob = TextBlob(whole_dialogue[character])
        sentiment = blob.sentiment.polarity
        characters.append({
            'name': character,
            'degree_centrality':g.degree(node),
            'betweenness_centrality':g.betweenness(node),
            'overall_sentiment':sentiment,
            'overall_verbosity':overall_verbosity[character],
            'overall_emotion':None
        });
    characters = sorted(characters, key=lambda c:c['betweenness_centrality'], reverse=True)

    return {
        'script_id': script['_id'],
        'title': script['title'],
        'characters':characters,
        'scenes':scenes
    }


def get_tmdb_metadata(tmdb, title):
    # extract basic metadata
    config = tmdb.Configuration().info()['images']
    search = tmdb.Search()
    res = search.movie(query=title)
    if len(res['results'])>0:
        mov_id = res['results'][0]['id'] #HACK: use the first one
        movie = tmdb.Movies(mov_id)

        # General movie info
        info = movie.info()
        keywords = movie.keywords()['keywords']

        # Characters & Director info
        credit = movie.credits()
        cast = []
        for person in credit['cast']:
            detail = tmdb.People(person['id']).info()
            actor = {
                'name': person['name'],
                'credit_order': person['order'],
                'character': person['character'],
                'birthdate': detail['birthday'],
                'gender': detail['gender'],
                'mdb_id': person['id'],
                'imdb_id': detail['imdb_id']
            }

            if person['profile_path'] is not None:
                actor['img_url'] = config['base_url'] + \
                    config['profile_sizes'][0] + person['profile_path']
            cast.append(actor)
        director = None
        for person in credit['crew']:
            if person['job']=='Director':
                director = {
                    'name': person['name']
                }
                if person['profile_path'] is not None:
                    director['img_url'] = config['base_url'] + \
                        config['profile_sizes'][0] + person['profile_path']

        record = {
            'query_title': title,
            'original_title': info['original_title'],
            'release_date': info['release_date'],
            'mdb_id': info['id'],
            'imdb_id': info['imdb_id'],
            'backdrop_path': config['base_url'] + config['backdrop_sizes'][0] + info['backdrop_path'],
            'vote_average': info['vote_average'],
            'vote_count': info['vote_count'],
            'tagline': info['tagline'],
            'runtime': info['runtime'],
            'genres': map(lambda x: x['name'], info['genres']),
            'keywords': map(lambda x: x['name'], keywords),
            'cast':cast,
            'director':director

        }
        return record
    return None

# def combine_two_movie_info(info1, info2):
#     for genre in info2['genres']:
#         if genre not in info1['genres']:
#             info1['genres'].append(genre)
#     info1['tagline'] += '&' + info2['tagline']
#     info1['original_title'] += '&' + info2['original_title']
#     for genre in info2['keywords']:
#         if genre not in info1['keywords']:
#             info1['keywords'].append(genre)
#     for actor in info2['cast']:
#         actors = filter(lambda x:x['mdb_id']==actor['mdb_id'], info1['cast'])
#         if len(actors)==0:
#             print 'adding cast', actor['character'], actor['name']
#             info1['cast'].append(actor)
def update_tmdb_metadata(db, tmdb_key, sid, forceUpdate=False):
    tmdb.API_KEY = tmdb_key
    script = db.scripts.find_one({'_id':sid})
    if script is None:
        return None
    # ====== update basic metadata
    # only if not exists (this data doesn't change)
    basic_metadata = db.tmdb_metadata.find_one({'script_id':sid})
    if forceUpdate==False and basic_metadata is not None:
        print 'Basic metadata exists for ',script['title'],'exists'
    else:
        if 'Kill Bill Volume 1 & 2' == script['title']: # exception: Kill Bill
            # print script['title'],': combine series.'
            basic_metadata = get_tmdb_metadata(tmdb, 'Kill Bill 1')
            # two = tmdb_metadata(tmdb, 'Kill Bill 2')
            # info = combine_two_movie_info(one, two)
        else:
            basic_metadata = get_tmdb_metadata(tmdb, script['title'])
        basic_metadata['script_id'] = sid
        db.tmdb_metadata.insert(basic_metadata)
    return basic_metadata

def update_script_metadata(db, sid):
    script = db.scripts.find_one({'_id':sid})
    if script is None:
        return None
    #   get script metadata
    script_metadata = get_script_metadata(script)
    #   story and narrative order
    #   TODO: maintain previous orders
    for i, scene in enumerate(script_metadata['scenes']):
        scene['story_order'] = i
        scene['narrative_order'] = i
    print 'update_script_metadata:', sid
    db.script_metadata.update({'script_id':sid}, {'$set': script_metadata}, upsert=True)

    return script_metadata
if __name__ == "__main__":
    keyfile = None
    if len(sys.argv) < 2:
        print "The Movie DB API keyfile needed."
        sys.exit(0)
    keyfile = sys.argv[1]
    # read a keyfile
    with open(keyfile, 'r') as f:
        tmdb_key =  f.readline().rstrip('\r\n')
        print 'APIKEY:', tmdb_key

    client = MongoClient('localhost', 27017)
    db = client.nolitory

    #   select a movie title
    scripts = []
    for script in db.scripts.find():
        scripts.append(script)

    for i, script in enumerate(scripts):
        print str(i + 1) + '. ' + script['title']

    mIdx = raw_input("Select a Movie (Enter number)")
    try:
        mIdx = int(mIdx) - 1
        if mIdx < 0 or mIdx >= len(scripts):
            print 'Wrong Selection.'
            sys.exit(0)
    except ValueError:
        # Handle the exception
        print 'Please enter an integer!'
        sys.exit(0)
    script = scripts[mIdx]
    print 'Selected Movie: ', script['title']

    update_script_metadata(db, script['_id'])
