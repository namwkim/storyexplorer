
import urllib
import HTMLParser
import re
import sys
from bs4 import BeautifulSoup
import bs4
import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn import preprocessing
import time
import json
import io
from pymongo import MongoClient
import warnings
with warnings.catch_warnings():
    warnings.simplefilter("ignore")
import urllib2
import docx

#TODO:
# 1. prevent dialogue with numbers and special charaters being removed
# Resources:
# - http://www.screenwriting.info/04.php
# - http://slugline.co/basics/
# - https://screencraft.org/2015/05/07/elements-of-screenplay-formatting/
# Screen Heading (Bold, Short Indent, Starting with INT. or EXT. -
# Location - Time)
SCENE_HEADING = "Scene Heading"
# Action (No Bold, Short Intent, After Heading or Dialogue)
ACTION = "Action"
# Character name (Bold, Long Intent, often followed by extensions )
CHARACTER_NAME = "Character Name"
# Dialogue (No Bold, After Character Name, often after Action (Cont'd))
DIALOGUE = "Dialogue"
# Parenthetical (After Character Name)
# PARENTHETICAL   = "Parenthetical"
TRANSITION = "Transition"
PARENTHETICAL = "Parenthetical"
IGNORE = "Ignore"
# EXTENSIONS      = "Extensions"
# SHOTS           = "Shots"

ignores = ["CUT TO", "DISSOLVE TO", "SMASH OUT", "QUICK OUT", "FADE IN",
    "FADE TO", "INSERT CUT", "FADE OUT", "WIPE TO", "IRIS IN", "IRIS OUT", "BACK TO", "FLASHBACK",
    "CONTINUED", "ANGLE ON", "DISSOLVE IN", "EXTREME CLOSE UP", "PAN TO", "CREDITS",
    "REVERSE ANGLE"]

def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def crawl_scripts(url):
    """
    Given a url to a script, extract the html text and parse it into segments.
    """
    print "Crawling scripts..............................................."
    ext = url.split(".")[-1]
    # if ext=='pdf':

    segments = []
    doc = urllib.urlopen(url).read()

    # HACK: movie specific rules
    # doc = doc.replace('<<COLOUR SEQUENCE>>', '')

    soup = BeautifulSoup(doc, 'lxml') #'html.parser')
    script_text = soup.find("pre")

    if( script_text.find("pre") ):
        print('Found a <pre> inside the <pre>')
        script_text = script_text.find("pre")

    print 'Script Snippet:'
    print(str(script_text)[:512])
    # line by line segments
    # print soup.pre.html.pre

    for string in script_text.strings:
        # print '============='
        # text = unicode(child.string)
        # if isinstance(child, bs4.element.Tag):
        #
        #     if len(text.strip()) == 0:
        #         continue
        #     if len(re.sub(r'[^a-zA-Z]','',text))==0:
        #         continue
        #     segments.append(text)
        #     print '----', repr(text)
        # elif isinstance(child, bs4.element.NavigableString):
        #     for text in text.split("\n\n"):
        #         if len(text.strip()) == 0:
        #             continue
        #         if len(re.sub(r'[^a-zA-Z]','',text))==0:
        #             continue
        #         segments.append(text)
        #         print '----', repr(text)
        lines = string.split('\n')
        for line in lines:
            # print repr(unicode(line))
            if len(line)==0 or len(line.strip())==0: # exclude empty string
                # print 'Skipped: empty string:', line
                continue
            if len(re.sub(r'[^a-zA-Z]','',line))==0: # nonsense line
                # print 'Skipped: non alphabet:', line
                continue
            segments.append(unicode(line.expandtabs()))
    return segments

def calc_feature(segment, feature):
    alphabet = re.sub(r'[^a-zA-Z\s]','',segment) # exclude non alphabets except space
    #   1. All Caps == SCENE_HEADING, CHARACTER_NAME, SHOTS, TRANSITIONS
    no_paren = re.sub(r'\([^)]*\)', '', segment) # exclude parenthetical
    alphabet_no_paren = re.sub(r'[^a-zA-Z]','',no_paren) # exclude non alphabets
    feature['all_caps'] = alphabet.isupper() or alphabet_no_paren.isupper()

    #   2. Left Margin
    # print float(len(segment) - len(segment.lstrip()))
    feature['left_margin'] = len(segment) - len(segment.lstrip())

    #   3. EXT. INT. == SCENE_HEADING
    feature['heading'] = ('EXT.' in segment or 'EXT ' in segment or \
        'INT.' in segment or 'INT ' in segment)
    #   4. Ignore
    # ignore shots & transitions if possible
    feature['ignore'] = False
    for ignore in ignores:
        if ignore == alphabet.strip():
            feature['ignore'] = True
            break

    #  ignore only numbers
    no_special = re.sub('[^A-Za-z0-9]+', '', segment) #remove special characters
    if is_int(no_special):
        feature['ignore'] = True
    #   ignore only specials
    if len(no_special)==0:
        feature['ignore'] = True
def extract_features(segments):
    """
    Use screenwriting domain knowledge to extract features
    * Refer to how screenwriting software formats a screenplay script.
    """
    print "Extracting features............................................."


    featured = []
    for segment in segments:
        feature = {}
        calc_feature(segment, feature)
        # print feature['all_caps'], segment
        featured.append({'content':segment, 'feature':feature})
    return featured


def classify_margins(segments, num_labels):
    features = []
    unique_margins = {}
    for segment in segments:
        # print segment['content']
        features.append([float(segment['feature']['left_margin'])])
        unique_margins[segment['feature']['left_margin']] = segment['feature']['left_margin']
    # print unique_margins
    #   cluster margins
    model = KMeans(n_clusters=num_labels)
    predicted = model.fit_predict(features)

    #   rank margins
    means = map(lambda x: x[0], model.cluster_centers_)
    margin_classes = zip(xrange(len(means)), means)
    margin_counts = zip(xrange(len(means)),
        map(lambda x: len(filter(lambda y: y==x, model.labels_)),
            xrange(len(means))))
    margin_ranks = {}
    margin_count_ranks = {}
    for i, c in enumerate(sorted(margin_classes, key=lambda x: x[1])):
        margin_ranks[c[0]] = i
    # print margin_ranks
    # print margin_counts
    for i, c in enumerate(sorted(margin_counts, key=lambda x: x[1], reverse=True)):
        margin_count_ranks[c[0]] = i
    # print margin_count_ranks
    return {'size_ranks': margin_ranks, 'count_ranks': margin_count_ranks, \
        'predicted': predicted}




def predict_classes(featured):
    """
        Use a clustering algorithm to predict segment labels
    """
    print "Predicting ....................................................."

    # Classify SCENE_HEADING, CHARACTER and SHOTS/TRANSITIONS

    # Method 1
    allcaps = filter(lambda x: x['feature']['all_caps'] and not x['feature']['ignore'], featured)
    result = classify_margins(allcaps, 3)
    #   assign tags to labels

    # HACK: Problem with Amy's use of deterministic margin sizes
    # -> Can't incorporate variable margin sizes for the same tag
    # -> We use clustering to classify similar margins
    # HACK: Problem with Amy's use of repeat count of character names
    # -> Extra characters might be ignored.
    for i, segment in enumerate(allcaps):
        if result['size_ranks'][result['predicted'][i]] == 0: #first rank == leftmost
            if segment['feature']['heading']:#HACK: only if contains INT. EXT.
                segment['tag'] = SCENE_HEADING
            else:
                segment['tag'] = ACTION
        elif result['count_ranks'][result['predicted'][i]] == 0: # the most frequent margins
            segment['tag'] = CHARACTER_NAME
            # print CHARACTER_NAME, segment['content']
        # print 'TAG', segment['tag'], 'CONTENT:',segment['content']

    noTags = filter(lambda x: x.has_key('tag')==False, allcaps)
    # Classify ACTION, DIALOGUE, PARENTHETICAL by margin size
    allNoncaps = filter(lambda x: not x['feature']['all_caps'] and not x['feature']['ignore'], featured)
    allNoncaps = noTags + allNoncaps
    result = classify_margins(allNoncaps,4)
    for i, segment in enumerate(allNoncaps):
        if result['size_ranks'][result['predicted'][i]] == 0: #first rank == leftmost
            segment['tag'] = ACTION
        elif result['size_ranks'][result['predicted'][i]] == 1: # second rank == dialogue
            segment['tag'] = DIALOGUE
        elif result['size_ranks'][result['predicted'][i]] == 2 and \
            (segment['content'].strip().startswith('(') or \
            segment['content'].strip().endswith(')')): # third rank == parenthetical
                segment['tag'] = PARENTHETICAL
        else:
            segment['tag'] = IGNORE

    # Method 2
    # segments = filter(lambda x: not x['feature']['ignore'], featured)
    # # Heading&Action, Dialogue, parenthetical, Character Name, Others
    # result = classify_margins(segments, 5)
    # for i, segment in enumerate(segments):
    #     if result['size_ranks'][result['predicted'][i]] == 0 and \
    #         segment['feature']['heading']==True: #HACK: only if contains INT. EXT.
    #         segment['tag'] = SCENE_HEADING
    #     elif result['size_ranks'][result['predicted'][i]] == 0 and \
    #         segment['feature']['heading']==False:
    #         segment['tag'] = ACTION
    #     elif result['size_ranks'][result['predicted'][i]] == 1:
    #         segment['tag'] = DIALOGUE
    #     elif result['size_ranks'][result['predicted'][i]] == 2 or \
    #         segment['content'].strip().startswith('(') or \
    #         segment['content'].strip().endswith(')'):
    #         segment['tag'] = PARENTHETICAL
    #     elif result['size_ranks'][result['predicted'][i]] == 3 and \
    #         segment['feature']['all_caps']==True:
    #         segment['tag'] = CHARACTER_NAME
    #     else:
    #         segment['tag'] = IGNORE

        # print 'TAG', segment['tag'], 'CONTENT:',segment['content']
    ignored = filter(lambda x: x['feature']['ignore'], featured)
    for segment in ignored:
        segment['tag'] = IGNORE

def post_process(title, segments):
    """
        Clean or merge data if necessary.
        (Movie specific cleaning rules)
    """
    print "Cleaning", title, "....................................................."
    #   Remove Extension (e.g., O.S, V.O)
    ignore_rest = False
    for i, segment in enumerate(segments):
        # if segment['tag']==CHARACTER_NAME:
        #     segment['content'] = re.sub(r'\([^)]*\)', '', segment['content']) # exclude parenthetical
        # Memento ignore rules

        if "MEMENTO" in segment['content'] and "Revision" in segment['content']:
            segment['tag'] = IGNORE
        if "The following is Jonathan Nolan's short story" in segment['content']:
            ignore_rest = True
        if ignore_rest:
            segment['tag'] = IGNORE

batman_dialogues = [0,1689100,1193800,1193165,1676400,1663700,1663065]
batman_actions =[762000 ,160020 ,761365,840105 ,774700 ,748665,774065 ,279400\
    ,278765,749300 ,285115]
batman_characters =[2108200,433070,-22225,68580,1074420,72390\
    ,2578100,524510,2577465,-24130]

prestige_dialogues = [1193800]
prestige_actions =[279400]
prestige_characters =[339725,65405,705485,2290445,1376045,1651000,156845,\
    796925,248285,1162685]


def get_batman_tag(p, segment, segments):
    left_indent = p.paragraph_format.left_indent
    if left_indent in batman_dialogues:
        segment['tag'] = DIALOGUE
        if 'CRANE' in p.text.strip() and 'WHO KNOWS?!!' in p.text.strip():
            segments.append({
                'tag': CHARACTER_NAME,
                'content': "CRANE (CONT'D)"
            })
            segment['content'] = "WHO KNOWS?!!"
        return True
    elif left_indent in batman_actions:
        segment['tag'] = ACTION
        if p.text.strip() == 'FLASS':
            segment['tag'] = CHARACTER_NAME
        return True
    elif left_indent in batman_characters:
        segment['tag'] = CHARACTER_NAME
        return True
    else:
        return False
def get_prestige_tag(p, segment, segments):
    left_indent = p.paragraph_format.left_indent
    if left_indent in prestige_dialogues:
        segment['tag'] = DIALOGUE
        return True
    elif left_indent in prestige_actions:
        segment['tag'] = ACTION
        return True
    elif left_indent in prestige_characters:
        segment['tag'] = CHARACTER_NAME
        if p.text == unicode("Well, I'll make it a little harder, shall I?") or \
            p.text==unicode("I've missed you.\tFallon's missed you.\tWe both have."):
            segments.append({
                'tag': DIALOGUE,
                'content': p.text
            })

        return True
    else:
        return False

def parse_pdf(title, url):
    doc = docx.Document(url)
    segments = []
    prev_segment = None
    all_left_margins = {}
    for p in doc.paragraphs:
        if len(p.text)==0 or len(p.text.strip())==0: # exclude empty string
            # print 'Skipped: empty string:', p.text
            continue
        if len(re.sub(r'[^a-zA-Z]','',p.text).strip())==0: # nonsense line
            # print 'Skipped: non alphabet:', p.text
            continue
        left_indent = p.paragraph_format.left_indent
        segment = {}
        feature   = {}
        calc_feature(p.text, feature)
        segment['content'] = p.text.strip()
        if feature['heading']:
            segment['tag'] = SCENE_HEADING
        elif feature['ignore']:
            segment['tag'] = IGNORE
        elif p.alignment == docx.enum.text.WD_ALIGN_PARAGRAPH.CENTER:
            segment['tag'] = CHARACTER_NAME
        elif (p.text.strip().startswith('(') or p.text.strip().endswith(')')) \
            and len(re.findall('\(.*?\)',p.text))==1:
            # separate parenthetical and dialogue
            paren = re.findall('\(.*?\)',p.text)[0]
            segments.append({
                'tag': PARENTHETICAL,
                'content': paren
            })
            segment['content'] = re.sub(r'\([^)]*\)', '', p.text)
            segment['tag'] = DIALOGUE
        elif p.text.strip().startswith('(') and p.text.strip().startswith(')'):
            segment['tag'] = PARENTHETICAL
        elif prev_segment is not None and (prev_segment['tag']==CHARACTER_NAME \
            or prev_segment['tag']==PARENTHETICAL):
            segment['tag'] = DIALOGUE
        elif left_indent==None:
            segment['tag'] = ACTION
        elif (title=="Batman Begins" and get_batman_tag(p, segment, segments)) or \
            (title=="Prestige" and get_prestige_tag(p, segment, segments)):
            segment['tag'] = segment['tag']
        else:
            if all_left_margins.has_key(left_indent)==False:
                all_left_margins[left_indent] = 0
            all_left_margins[left_indent] += 1
            # if left_indent==1162685:
            #     print repr(p.text)
            segment['tag'] = IGNORE
        prev_segment = segment
        segments.append(segment)
        # reconstruct indentation

        # if p.paragraph_format.left_indent is not None:
        #     indent = ' '*int(round((add_indent+p.paragraph_format.left_indent)/9525.0/12.0))
        # else:
        #     indent = ' '*int(round((add_indent+min_left_indent)/9525.0/12.0))
        # print '---',indent + p.text
        # segments.append(indent + p.text)


    print all_left_margins
    return segments


if __name__ == "__main__":
    # urls = {
    #     "Memento": "http://www.imsdb.com/scripts/Memento.html"
    #     "Pulp Fiction": "http://www.imsdb.com/scripts/Pulp-Fiction.html"
    # }
    if len(sys.argv) < 2:
        # default_url = 'http://www.imsdb.com/scripts/Memento.html'
        # default_url = 'http://www.imsdb.com/scripts/Pulp-Fiction.html'
        # default_url = 'http://www.imsdb.com/scripts/Eternal-Sunshine-of-the-Spotless-Mind.html'

        # default_url = 'http://www.imsdb.com/scripts/Usual-Suspects,-The.html'
        # default_url = 'http://www.imsdb.com/scripts/Reservoir-Dogs.html'

        # default_url = 'http://www.imsdb.com/scripts/Annie-Hall.html'
        # default_url = 'http://www.imsdb.com/scripts/500-Days-of-Summer.html'
        # default_url = 'http://www.imsdb.com/scripts/12-Monkeys.html'
        # default_url = 'http://www.imsdb.com/scripts/Kill-Bill-Volume-1-&-2.html'

        # default_url = 'http://www.imsdb.com/scripts/Citizen-Kane.html'
        # default_url = 'http://www.imsdb.com/scripts/Fight-Club.html'

        # TODO:seems like can't get the left margin right in pdf-flies.
        # default_url = 'Prestige.docx'#'http://www.dailyscript.com/scripts/Prestige.pdf'
        # default_url = 'Batman-Begins.docx' #'http://www.nolanfans.com/library/pdf/batmanbegins-screenplay.pdf'


        default_url = 'http://www.imsdb.com/scripts/Babel.html'
        # default_url = 'http://www.imsdb.com/scripts/Mulholland-Drive.html'

        print 'Input url required \
            (default:', default_url, ' )'
        sys.argv.append(default_url)
    url = sys.argv[1]
    title = url.split('/')[-1].split('.')[0].replace('-', ' ')
    print 'Title:', title
    isDocx = url.split('/')[-1].split('.')[1]=='docx'

    # text = textract.process(url)
    # for line in text.split('\n'):
    #     print '----',line
    print '____________________________________________________________'
    # db connection
    client = MongoClient('localhost', 27017)
    db = client.nolitory
    scripts = db.scripts


    # crawling script

    if isDocx :
        start_time = time.time()  # calc time taken
        featured = parse_pdf(title, url)
        print title, 'parsing time elapsed: ', time.time() - start_time
    else:
        start_time = time.time()  # calc time taken
        segments = crawl_scripts(url)
        print 'Script crawling time elapsed: ', time.time() - start_time

        # extracting features
        start_time = time.time()  # calc time taken
        featured = extract_features(segments)
        print 'Feature extratcion time elapsed: ', time.time() - start_time

        # predicting segment tags
        predict_classes(featured);
        start_time = time.time()  # calc time taken
        print 'Tag prediction time elapsed: ', time.time() - start_time

    # post processing cleaning
    post_process(title, featured)

    # for segment in featured:
    #     print segment['tag'], '---', repr(segment['content'])

    print 'Saving into database........................................'
    if featured[0]['tag'] != SCENE_HEADING:
        print "Inserting a dummy heading at the front."
        featured.insert(
            0, {'tag': SCENE_HEADING, 'content': 'TITLE:'+title.upper()})

    # check if the movie already exists
    existing_record = scripts.find_one({'title': title})
    if existing_record is None:
        scripts.insert_one({
            'title': title,
            'segments': map(lambda (i, x): {'segID': i, 'tag': x['tag'],
                'content': x['content'].strip()}, enumerate(featured))
        })
    else:
        scripts.update_one(
            {'title': title},  # should be a unique title.
            {'$set': {'segments': \
                map(lambda (i, x) : { 'segID': i, 'tag': x['tag'], \
                'content': x['content'].strip()}, enumerate(featured))}

        })
