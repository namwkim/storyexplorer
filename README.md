# Story Explorer
Exploring Nonlinear Narratives in Movie Scripts using Story Curves

Contact: Nam Wook Kim namwkim85@gmail.com

  
![Story Explorer](http://storycurve.namwkim.org/img/storyexplorer.jpg)


## Install

* Requirement: MongoDB, Node, Python 2.7

1. Restore Movie Data 

```
mongorestore --username [username] --password [password] --authenticationDatabase admin --drop mongodb_dump/
```

2. Run 
Preferably, the following command is run using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/).
```
> pip install -r requirements.txt

```

The server accesses the restored database. Thus, you need to put your db authentication info in `backend/data/dbauth.txt` in which id and passward is separated by a comma (e.g., storyid,storypw).

```
> npm install
> npm start
```

## Folder Structure
1. Server.

   [`backend/server.py`](https://github.com/namwkim/storyexplorer/blob/master/backend/server.py)

2. Data & Data Processing Scripts

   [`backend/data/`](https://github.com/namwkim/storyexplorer/tree/master/backend/data)
   
   2.1 Crawling and parsing scripts
   
      [`backend/data/extract-scripts.py`](https://github.com/namwkim/storyexplorer/blob/master/backend/data/extract-scripts.py)

   2.2. Extracting semantic metadata
   
      [`backend/data/metadata.py`](https://github.com/namwkim/storyexplorer/blob/master/backend/data/metadata.py)
      
      
3. UI

   [`frontend/src`](https://github.com/namwkim/storyexplorer/tree/master/frontend/src)
   
   3.1. Story Explorer
   
   [`frontend/src/modules/vis/`](https://github.com/namwkim/storyexplorer/tree/master/frontend/src/modules/vis)
   
   3.2. Script tagging and Displaying semantic metadata
   [`frontend/src/modules/prep`](https://github.com/namwkim/storyexplorer/tree/master/frontend/src/modules/prep)
   
