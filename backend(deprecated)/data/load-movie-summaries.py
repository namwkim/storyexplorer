

import sys
import io
import os
import csv
from pymongo import MongoClient


if __name__ == "__main__":
    # db connection
    client = MongoClient('localhost', 27017)
    db = client.nolitory

    directory = "./MovieSummaries/"
    character_metadata_file = directory + "character.metadata.tsv"
    movie_metadata_file = directory + "movie.metadata.tsv"
    plot_summary_file = directory + "plot_summaries.txt"
    if os.path.isdir(directory)==False:
        print directory, 'does not exist.'
        sys.exit(0)

    #   load character metadata
    charCol = db.CMU_character_metadata
    charCol.delete_many({})# clear collection
    characters = []
    if os.path.exists(character_metadata_file):
        with open(character_metadata_file) as tsv_file:
            reader = csv.reader(tsv_file, delimiter='\t')
            for row in reader:
                record = {
                    'wiki_id' : row[0],
                    'char_name' : row[3],
                    'actor_gender' : row[5],
                    'actor_height' : row[6],
                    'actor_ethnicity' : row[7],
                    'actor_name' : row[8],
                    'actor_age' : row[9]
                }
                # print record
                characters.append(record)
    charCol.insert_many(characters)

    #   load movie metadata
    movieCol = db.CMU_movie_metadata
    movieCol.delete_many({})# clear collection
    movies = []
    if os.path.exists(movie_metadata_file):
        with open(movie_metadata_file) as tsv_file:
            reader = csv.reader(tsv_file, delimiter='\t')
            for row in reader:
                record = {
                    'wiki_id' : row[0],
                    'title' : row[2],
                    'release_date' : row[3],
                    'genres' : row[8]
                }
                # print record
                movies.append(record)
    movieCol.insert_many(movies)

    #   load plot summaries
    sumCol = db.CMU_plot_summaries
    sumCol.delete_many({})# clear collection
    summaries = []
    if os.path.exists(plot_summary_file):
        with open(plot_summary_file) as tsv_file:
            reader = csv.reader(tsv_file, delimiter='\t')
            for row in reader:
                record = {
                    'wiki_id' : row[0],
                    'plot_summary' : row[1]
                }
                # print wiki_id, char_name, actor_gender, actor_height, actor_ethnicity, actor_name, actor_age
                summaries.append(record)
    sumCol.insert_many(summaries)
