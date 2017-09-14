import {
	ACTION,
	CHARACTER_NAME,
	STORY
}
from './constants';


export default class Helper {
	static calcTemporalNonlinearity(scenes){
		let maxOrder = scenes.length-1;
		let diffSum = scenes.map(d=>Math.abs(d.narrative_order-d.story_order))
			.reduce((acc, cur)=>acc+cur,0);
		let maxDiff = scenes.map(d=>Math.abs(maxOrder-d.story_order))
			.reduce((acc, cur)=>acc+cur,0);
		// console.log('nonlinearity:', diffSum/maxDiff);
		return diffSum/maxDiff;

	}
  static inferGender(cast, characters){
    for (let character of characters){
      let person = cast.filter(x=>
        x.character.toLowerCase().includes(character.name.toLowerCase()));
      if (person.length>0){
        character.actor = person[0].name;
        if (person[0].gender==2){
            character.gender = 'Male';
        }else if (person[0].gender==1){
          character.gender = 'Female';
        }else{
          character.gender = 'Unknown';
        }
        character.img_url = person[0].img_url;
      }else{
        character.gender = 'Unknown';
      }
    }
  }
  static getCharData(scriptinfo, options){
    // ranking characters and choose top ones, and put the rest into one line
    let chardata = scriptinfo.characters
      .sort((a,b)=>b.overall_verbosity-a.overall_verbosity)
      .slice(0,options.numChars)
      .map(d=>({filter:d.name, type:'characters', scenes:scriptinfo.scenes}));//descending
    // let restChars = topChars.splice(0, 10);
    //   .map(d=>({filter:d.name, scenes:scenedata}));//descending
    //
    // remove characters not in the top ranking
		let topChars = chardata.map(d=>d.filter);
		scriptinfo.scenes.forEach(d=>{
			d.characters = d.characters.filter(c=>topChars.includes(c))
				.sort((a,b)=>{
					return topChars.indexOf(a)-topChars.indexOf(b);
				});
		});
    return chardata;
  }
  static getSceneMetadata(scriptinfo, type, top){
    //TODO: improve loc resolution
    // get unique locations
    let aggregates = Helper.resolveNames(scriptinfo, type, top);
    return aggregates.map(d=>({filter:d.key, type:type, scenes:scriptinfo.scenes}));
  }
  // static getTimeData(scriptinfo, options){
  //   let aggregates = Helper.resolveNames(scriptinfo, 'time', options.numTimes);
  //   return aggregates.map(d=>({filter:d.key, type:'time', scenes:scriptinfo.scenes}));
  // }
  // static getIntExtData(scriptinfo, options){
  //   let aggregates = Helper.resolveNames(scriptinfo, 'setting', options.numIntExts);
  //   return aggregates.map(d=>({filter:d.key, type:'setting', scenes:scriptinfo.scenes}));
  // }

  static getScriptData(scriptinfo, ordering){
    let charMap = scriptinfo.characters.reduce((acc, cur)=>{
      acc[cur.name] = cur;
      return acc;
    }, {});
    let scenes = scriptinfo.scenes;
		let ordered = null;
		if (ordering==STORY){
			// console.log('story_order');
			ordered = scenes.sort((a,b)=>a.story_order-b.story_order);
		}else{
			// console.log('narrative_order');
			ordered = scenes.sort((a,b)=>a.narrative_order-b.narrative_order);
		}

    let script=[];
    // group by scene
    for (let scene of ordered){
      // collect all segments in the scene
      let segments = [];
      scene.actions
      .concat(scene.conversations)
      .sort((a,b)=>a.order>b.order)
      .forEach(item=>{
        if (item.character==undefined){
          segments.push({
            tag: ACTION,
            content: item.content
          });
        }else{
          segments.push({
            tag:CHARACTER_NAME,
            content: item.character,
            imgUrl: charMap[item.character].img_url
          });
          item.dialogue.forEach(d=>{
            segments.push({tag:d.type,content:d.content});
          });
        }
      });
      script.push({
        heading: scene.heading,
        so: scene.story_order,
        no: scene.narrative_order,
        segments:segments
      });
    }
    return script;
  }

  static resolveNames(scriptinfo, type, top){
    let scenes = scriptinfo.scenes;
    // let names = d3.set(scenes, d=>d.scene_metadata[type]);
    // resolve similar location names
    // let resMap = d3.map();
    // names.each(l1=>{
    //   let s = l1;
    //   names.each(l2=>{
    //     if (l1.includes(l2)){
    //       s = s==null?l2:(s.length>l2.length? l2:s);
    //     }
    //   });
    //   resMap.set(l1, s);
    // });
    // // set new name
    // scenes.map(s=>{
    //   s.scene_metadata[type] = resMap.get(s.scene_metadata[type]);
    // });
    // rank locations

		// scenes.forEach(d=>{
		// 	if (d.scene_metadata[type]!=null){
		// 			d.scene_metadata[type] = d.scene_metadata[type].replace(/ *\([^)]*\) */g, '');
		// 	}
		// });
    let aggregates = d3.nest()
      .key(d=>d.scene_metadata[type])
      .rollup(function (v) {
        return d3.sum(v, (d)=>d.scene_metadata.size);
      })
      .entries(scenes);
    aggregates = aggregates.filter(d=>d.key!='null');

    aggregates.sort(function (a, b) {
      return b.value - a.value;
    });

		aggregates = aggregates.slice(0, top);
		// console.log(aggregates);
		let topItems = aggregates.map(d=>d.key);
		scenes.map(s=>{
			if (topItems.includes(s.scene_metadata[type])==false){
					s.scene_metadata[type] = null;
			}
		});
    return aggregates;
  }
  static resolveCharacterInfo(cast, characters, releaseDate){
    for (let character of characters){
      let person = cast.filter(x=>
        x.character.toLowerCase().includes(character.name.toLowerCase()));
      if (person.length>0){
        character.actor = person[0].name;
        if (person[0].gender==2){
            character.gender = 'Male';
        }else if (person[0].gender==1){
          character.gender = 'Female';
        }else{
          character.gender = 'Unknown';
        }
        let birthDate = new Date(person[0].birthdate);
        character.age = releaseDate.getFullYear()-birthDate.getFullYear();
        character.credit_order = person[0].credit_order;
        character.imdb_id = person[0].imdb_id;
        character.img_url = person[0].img_url;
      }else{
        character.actor = null;
        character.gender = null;
        character.age = null;
        character.credit_order = null;
        character.img_url = 'http://style.anu.edu.au/_anu/4/images/placeholders/person.png';
      }
    }
  }
}
