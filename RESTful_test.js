const http = require('http');
const url  = require('url');
const util  = require('util');
const querystring = require('querystring')
const https = require('https');
const deasync = require('deasync');

// begin Tools
function setOptions(queryParam) {
    // oxfordhk.azure-api.net/academic/v1.0/evaluate?expr=Id=2153635508&count=10&offset=0&attributes=Id,Ti,Y,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId&subscription-key=f7cc29509a8443c5b3a5e56b0e38b5a6
    // oxfordhk.azure-api.net/academic/v1.0/evaluate?expr=And(RId=2100837269,Or(Id=2151561903,Id=2151561903))&count=10&offset=0&attributes=Id,Ti,Y,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId&subscription-key=f7cc29509a8443c5b3a5e56b0e38b5a6
    var options = {
        hostname: 'oxfordhk.azure-api.net',
        port: 80,
        path: '/academic/v1.0/evaluate?'+queryParam,
        method: 'GET',
    };
    
    return options;
}

function setQueryParam(expr) {

    var queryParam = querystring.stringify({
        "expr": expr,
        // "model": "latest",
        "count": "200000",
        "offset": "0",
        // "orderby": "{string}",
        // "attributes": "Id,Ti,Y,D,CC,AA.AuN,AA.AuId,AA.AfN,AA.AfId,RId",
        "attributes": "Id,Y,CC,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId",
        "subscription-key" : "f7cc29509a8443c5b3a5e56b0e38b5a6"
    });
	// var queryParam = 'expr=' + expr;
	// queryParam = queryParam + '&count=200000';
	// queryParam = queryParam + '&offset=0';
	// queryParam = queryParam + '&attributes=Id,Ti,Y,CC,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId';
	// queryParam = queryParam + '&subscription-key=f7cc29509a8443c5b3a5e56b0e38b5a6';
	// queryParam = querystring.stringify(queryParam);
    return queryParam;
}

function setQueryParamAttr(expr,attr) {

    var queryParam = querystring.stringify({
        "expr": expr,
        "count": "200000",
        "offset": "0",
        "attributes": attr,
        "subscription-key" : "f7cc29509a8443c5b3a5e56b0e38b5a6"
    });
	// var queryParam = 'expr=' + expr;
	// queryParam = queryParam + '&count=200000';
	// queryParam = queryParam + '&offset=0';
	// queryParam = queryParam + '&attributes=Id,Ti,Y,CC,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId';
	// queryParam = queryParam + '&subscription-key=f7cc29509a8443c5b3a5e56b0e38b5a6';
	// queryParam = querystring.stringify(queryParam);
    return queryParam;
}

function setOptionsId(Id) {
    var queryParam = querystring.stringify({
        "expr": "Id="+Id,
        // "model": "latest",
        "count": "200000",
        "offset": "0",
        // "orderby": "{string}",
        // "attributes": "Id,Ti,Y,D,CC,AA.AuN,AA.AuId,AA.AfN,AA.AfId,RId",
        "attributes": "Id,Y,CC,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId",
        "subscription-key" : "f7cc29509a8443c5b3a5e56b0e38b5a6"
    });
    
    return setOptions(queryParam);
}

function setOptionsAu(Au) {
    var queryParam = querystring.stringify({
        "expr": "Composite(AA.AuId="+Au+")",
        // "model": "latest",
        "count": "200000",
        "offset": "0",
        // "orderby": "{string}",
        // "attributes": "Id,Ti,Y,D,CC,AA.AuN,AA.AuId,AA.AfN,AA.AfId,RId",
        "attributes": "Id,Y,CC,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId",
        "subscription-key" : "f7cc29509a8443c5b3a5e56b0e38b5a6"
    });
    
    return setOptions(queryParam);
}

function SetOptionsCi(Id) {
    var queryParam = querystring.stringify({
        "expr": 'RId='+Id+'',
        // "model": "latest",
        "count": "200000",
        "offset": "0",
        // "orderby": "{string}",
        // "attributes": "Id,Ti,Y,D,CC,AA.AuN,AA.AuId,AA.AfN,AA.AfId,RId",
        "attributes": 'Id,Y,CC,AA.AuId,AA.AfId,RId,F.FId,C.CId,J.JId',
        "subscription-key" : 'f7cc29509a8443c5b3a5e56b0e38b5a6'
    });
    
    return setOptions(queryParam);
}

function setExprRefs(entities) {
	var exprs = [['Id=123']];
	var RIds = {};
	var expr = exprs[exprs.length-1];
	var count = 2;
	
    entities.forEach((entity) => {
		if(entity.hasOwnProperty('RId')) {
			entity.RId.forEach( (RId) => {
				if(false === RIds.hasOwnProperty(RId)) {
					expr[0] = 'Or(Id=' + RId + ',' + expr[0] + ')';
					RIds[RId] = 1;
					count = count + 8;;
					if(count + expr[0].length >= 2150) {
						// console.log(`expr leng : ${expr[0].length}`);
						exprs.push(['Id=123']);
						expr = exprs[exprs.length-1];
						count = 2;
					}
				}
			});
		}
    });
	
	// expr = 'Or(Id=1981123122,Or(Id=1970107317,Or(Id=1968806977,Id=2314342)))';
	
	return exprs;
}

function setExprRefsAuIds(entities,entitiesId1) {
	var exprs = [['Id=123']];
	var RIds = {};
	var FIds = {};
	var CIds = {};
	var JIds = {};
	var AIds = {};
	var expr = exprs[exprs.length-1];
	var count = 2;
	
    entities.forEach((entity) => {
		if(entity.hasOwnProperty('RId')) {
			entity.RId.forEach( (RId) => {
				if(false === RIds.hasOwnProperty(RId)) {
					expr[0] = 'Or(Id=' + RId + ',' + expr[0] + ')';
					RIds[RId] = 1;
					count = count + 8;;
					if(count + expr[0].length >= 2150) {
						// console.log(`expr leng : ${expr[0].length}`);
						exprs.push(['Id=123']);
						expr = exprs[exprs.length-1];
						count = 2;
					}
				}
			});
		}
    });
	
    entitiesId1.forEach((entity) => {
		if(entity.hasOwnProperty('AA')) {
			entity.AA.forEach( (AA) => {
				if(false === AIds.hasOwnProperty(AA.AuId)) {
					expr[0] = 'Or(Composite(AA.AuId=' + AA.AuId + '),' + expr[0] + ')';
					AIds[AA.AuId] = 1;
					count = count + 16;
					if(count + expr[0].length >= 2000) {
						// console.log(`expr leng : ${expr[0].length}`);
						exprs.push(['Id=123']);
						expr = exprs[exprs.length-1];
						count = 2;
					}
				}
			});
		}
		if(entity.hasOwnProperty('F')) {
			entity.F.forEach( (F) => {
				if(false === FIds.hasOwnProperty(F.FId)) {
					expr[0] = 'Or(Composite(F.FId=' + F.FId + '),' + expr[0] + ')';
					FIds[F.FId] = 1;
					count = count + 16;
					if(count + expr[0].length >= 2000) {
						// console.log(`expr leng : ${expr[0].length}`);
						exprs.push(['Id=123']);
						expr = exprs[exprs.length-1];
						count = 2;
					}
				}
			});
		}
		if(entity.hasOwnProperty('J')) {
			var J = entity.J;
			if(false === JIds.hasOwnProperty(J.JId)) {
				expr[0] = 'Or(Composite(J.JId=' + J.JId + '),' + expr[0] + ')';
				JIds[J.JId] = 1;
				count = count + 16;
				if(count + expr[0].length >= 2000) {
					// console.log(`expr leng : ${expr[0].length}`);
					exprs.push(['Id=123']);
					expr = exprs[exprs.length-1];
					count = 2;
				}
			}
		}
		if(entity.hasOwnProperty('C')) {
			var C = entity.C;
			if(false === CIds.hasOwnProperty(C.CId)) {
				expr[0] = 'Or(Composite(C.CId=' + C.CId + '),' + expr[0] + ')';
				CIds[C.CId] = 1;
				count = count + 16;
				if(count + expr[0].length >= 2000) {
					// console.log(`expr leng : ${expr[0].length}`);
					exprs.push(['Id=123']);
					expr = exprs[exprs.length-1];
					count = 2;
				}
			}
		}
    });
	
	
	return exprs;
}

function setExprAfIds(AfIds) {
	var exprs = [['AA.AfId=123']];
	var expr = exprs[exprs.length-1];
	var count = 4;
	
	// console.log(`af len : ${AfIds.length}`);
    AfIds.forEach((AfId) => {
		expr[0] = 'Or(AA.AfId=' + AfId + ',' + expr[0] + ')';
		count = count + 10;
		if(count + expr[0].length >= 2000) {
			exprs.push(['AA.AfId=123']);
			expr = exprs[exprs.length-1];
			count = 4;
		}
    });
	return exprs;
}

function getEntityFIds(entity) {
    var res = {};
    if(entity.hasOwnProperty('F')) {
        entity.F.forEach( (item) => {
            res[item.FId] = 1;
        });
    }
    return res;
}

function getEntityAuIds(entity) {
    var res = {};
	entity.AA.forEach( (item) => {
		res[item.AuId] = 1;
	});
    return res;
}

function getEntitiesIds(entities) {
    var res = {};
    entities.forEach((entity) => {
        res[entity.Id] = 1;
    });
    return res;
}

function getAuthorAfIds(entities) {
	var arrRes = [];
    var res = {};
    entities.forEach((entity) => {
		entity.AA.forEach( (item) => {
			if(item.hasOwnProperty('AfId')
				&& item.AuId === entities.Id 
				&& !res.hasOwnProperty(item.AfId) ) {
				res[item.AfId] = 1;
				arrRes.push(item.AfId);
			}
		});
    });
	res['array'] = arrRes;
    return res;
}
// end   Tools

// begin judeg Id type
function getIdType(chunks,options,resArray) {
    chunks = chunks.toString('utf-8');
    // console.log(`BODY: ${chunks}`);
    
    var entities = JSON.parse(chunks).entities;
    
    // console.log(`entities : ${JSON.stringify(entities)}`);
    
    var entity = entities[0];
    
    if(entities.length > 0 && entity.hasOwnProperty('AA')) {
        var resIndex = (options.resIndex >> 1);
        // console.log(`resIndex : ${resIndex}`);
        resArray[resIndex] = entities;
        resArray[resIndex]['isAu'] = (1 === (options.resIndex & 1));
		globalTypeQueryCount++;
    }
}

function getEntitiesId(Id1,Id2) {
    var optionsId1 = setOptionsId(Id1);
    var optionsAu1 = setOptionsAu(Id1);
    var optionsId2 = setOptionsId(Id2);
    var optionsAu2 = setOptionsAu(Id2);
    
    var resArray = [null,null];
    
    optionsId1['resIndex'] = 0;
    optionsAu1['resIndex'] = 1;
    optionsId2['resIndex'] = 2;
    optionsAu2['resIndex'] = 3;
    
    var optionsArray = [optionsId1,optionsAu1,optionsId2,optionsAu2];
    
    var queryCount = 0;
	globalTypeQueryCount = 0;
    optionsArray.forEach( (options) => {
		deasync.sleep(1);
        queryCount ++;
        
		((options) => {
            var requ = http.request(options, (resp) => {
                // console.log(`ALL: ${resp}`);
                // console.log(`STATUS: ${resp.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
                resp.setEncoding('utf8');
                
                var chunks  = "";
                resp.on('data', (chunk) => {
                    chunks = chunks + chunk;
                });
                
                resp.on('end', () => {
                    getIdType(chunks,options,resArray);
                    // end 1
                    queryCount --;
                })
            });

            requ.on('error', (e) => {
                // end 2
                queryCount --;
                console.log(`problem with request: ${e.message}`);
            });

            // write data to request body
            requ.end();
        })(options);
    });
    
    while(queryCount > 0 && globalTypeQueryCount < 2) {deasync.sleep(5);}
    
    return resArray;
}
// end   judeg Id type

// begin Id - Id
function getHopId2Id(entitiesId1,entitiesId2) {
    var paths = [];
    
    var Id1 = entitiesId1.Id;
    var Id2 = entitiesId2.Id;
    
    var entityId1 = entitiesId1[0];
    var entityId2 = entitiesId2[0];
    
    // 1-hop
    entityId1.RId.forEach( (itemRid) => {
        if(itemRid === entityId2.Id) {
            paths.push([Id1,Id2]);
        }
    });
    
    // 2-hop
    var FIds = getEntityFIds(entityId2);
    if(entityId1.hasOwnProperty('F')) {
        entityId1.F.forEach( (item) => {
            if( FIds.hasOwnProperty(item.FId) ) {
                paths.push([Id1,item.FId,Id2]);
            }
        });
    }
    if(entityId1.hasOwnProperty('C')) {
        var CId = entityId1.C.CId;
        if(entityId2.hasOwnProperty('C')) {
            if( CId === entityId2.C.CId) {
                paths.push([Id1,CId,Id2]);
            }
        }
    }
    if(entityId1.hasOwnProperty('J')) {
        var JId = entityId1.J.JId;
        if(entityId2.hasOwnProperty('J')) {
            if( JId === entityId2.J.JId) {
                paths.push([Id1,JId,Id2]);
            }
        }
    }
    var AuIds = getEntityAuIds(entityId2);
    if(entityId1.hasOwnProperty('AA')) {
        entityId1.AA.forEach( (item) => {
            if( AuIds.hasOwnProperty(item.AuId) ) {
                paths.push([Id1,item.AuId,Id2]);
            }
        });
    }
    
    return paths;
}

function getIdEntity(chunks,options,resArray,Ids) {
    chunks = chunks.toString('utf-8');
    // console.log(`BODY: ${chunks}`);
    
    var entities = JSON.parse(chunks).entities;
    
    // console.log(`entities length : ${entities.length}`);
    // console.log(`entities : ${JSON.stringify(entities)}`);
    
    entities.forEach((entity) => {
		if(false === Ids.hasOwnProperty(entity.Id)) {
			if(entity.hasOwnProperty('AA')) {
				resArray.push(entity);
			}
			Ids[entity.Id] = 1;
		}
    });
}

function getReference(entitiesId) {
    globalReferenceArray = [];
	globalReferenceIds = {};
    
    globalReferenceQueryCount = 0;
    entitiesId.forEach( (entity) => {
        if(entity.hasOwnProperty('RId')) {
            entity.RId.forEach( (RId) => {
			
				deasync.sleep(1);
                globalReferenceQueryCount ++;
                options = setOptionsId(RId);
                
                ((options) => {
                    var requ = http.request(options, (resp) => {
                        // console.log(`ALL: ${resp}`);
                        // console.log(`STATUS: ${resp.statusCode}, Ref`);
                        // console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
                        resp.setEncoding('utf8');
                        
                        var chunks  = "";
                        resp.on('data', (chunk) => {
                            chunks = chunks + chunk;
                        });
                        
                        resp.on('end', () => {
                            getIdEntity(chunks,options,globalReferenceArray,globalReferenceIds);
                            // end 1
                            globalReferenceQueryCount --;
                        })
                    });

                    requ.on('error', (e) => {
                        // end 2
                        globalReferenceQueryCount --;
                        console.log(`problem with request: ${e.message}`);
                    });

                    // write data to request body
                    requ.end();
                })(options);
            });
        }
    });
}

function getCitation(entitiesId) {
    globalCitationArray = [];
	globalCitationIds = {};
    
    globalCitationQueryCount = 0;
    entitiesId.forEach( (entity) => {
		deasync.sleep(1);
		globalCitationQueryCount ++;
		var options = SetOptionsCi(entity.Id);
		// options.expr = 'Composite(And('+options.expr+','+optionsYear+'))';
		
		((options) => {
			var requ = http.request(options, (resp) => {
				// console.log(`ALL: ${resp}`);
				// console.log(`STATUS: ${resp.statusCode}, Cit`);
				// console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
				resp.setEncoding('utf8');
				
				var chunks  = "";
				resp.on('data', (chunk) => {
					chunks = chunks + chunk;
				});
				
				resp.on('end', () => {
					getIdEntity(chunks,options,globalCitationArray,globalCitationIds);
					// end 1
					globalCitationQueryCount --;
				})
			});

			requ.on('error', (e) => {
				// end 2
				globalCitationQueryCount --;
				console.log(`problem with request: ${e.message}`);
			});

			// write data to request body
			requ.end();
		})(options);
    });
}

function getCitationPlus(entitiesId,exprs) {
    globalCitationArray = [];
	globalCitationIds = {};
    
    globalCitationQueryCount = 0;
    entitiesId.forEach( (entity) => {
		exprs.forEach( (exprArr) => {
			deasync.sleep(1);
			globalCitationQueryCount ++;
			
			var expr = exprArr[0];
			// expr = 'And(RId=' + entity.Id + ', Or(' + expr + '))';
			expr = "And(RId=" + entity.Id + "," + expr + ")";
			var queryParam = setQueryParam(expr);
			var options = setOptions(queryParam);
			// var options = SetOptionsCi(entity.Id);
			// options.expr = 'Composite(And('+options.expr+','+optionsYear+'))';
			
			// console.log(expr);
			// console.log(queryParam);
			
			((options) => {
				var requ = http.request(options, (resp) => {
					// console.log(`ALL: ${resp}`);
					// console.log(`STATUS: ${resp.statusCode}, Cit`);
					// console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
					resp.setEncoding('utf8');
					
					var chunks  = "";
					resp.on('data', (chunk) => {
						chunks = chunks + chunk;
					});
					
					resp.on('end', () => {
						getIdEntity(chunks,options,globalCitationArray,globalCitationIds);
						// end 1
						globalCitationQueryCount --;
					})
				});

				requ.on('error', (e) => {
					// end 2
					globalCitationQueryCount --;
					console.log(`problem with request: ${e.message}`);
				});

				// write data to request body
				requ.end();
			})(options);
		});
    });
}

function getAfIdEntity(chunks,options,resObj,resArray) {
    chunks = chunks.toString('utf-8');
    // console.log(`BODY: ${chunks}`);
    
    var entities = JSON.parse(chunks).entities;
    
    // console.log(`entities length : ${entities.length}`);
    // console.log(`entities : ${JSON.stringify(entities)}`);
    
    entities.forEach((entity) => {
		entity.AA.forEach( (AA) => {
			if(AA.hasOwnProperty('AfId')) {
				if(!resObj.hasOwnProperty(AA.AuId)) {
					resObj[AA.AuId] = {};
				}
				if(!resObj[AA.AuId].hasOwnProperty(AA.AfId)) {
					resObj[AA.AuId][AA.AfId] = 1;
					resArray.push(JSON.parse(JSON.stringify(AA)));
				}
			}
		});
    });
}

function getAfIdsPlus(entitiesId,exprs) {
    globalAfIdsObj = {};
	globalAuthorArray = [];
    
    globalAfIdsQueryCount = 0;
    entitiesId.forEach( (entity) => {
		entity.AA.forEach( (AA) => {
			exprs.forEach( (exprArr) => {
				deasync.sleep(1);
				globalAfIdsQueryCount ++;
				
				var expr = exprArr[0];
				expr = "Composite(And(AA.AuId=" + AA.AuId + "," + expr + "))";
				var queryParam = setQueryParam(expr);
				var queryParam = setQueryParamAttr(expr,'AA.AuId,AA.AfId');
				var options = setOptions(queryParam);
				
				// console.log(expr);
				// console.log(queryParam);
				
				((options) => {
					var requ = http.request(options, (resp) => {
						// console.log(`ALL: ${resp}`);
						// console.log(`STATUS: ${resp.statusCode}, AfId`);
						// console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
						resp.setEncoding('utf8');
						
						var chunks  = "";
						resp.on('data', (chunk) => {
							chunks = chunks + chunk;
						});
						
						resp.on('end', () => {
							getAfIdEntity(chunks,options,globalAfIdsObj,globalAuthorArray);
							// end 1
							globalAfIdsQueryCount --;
						})
					});

					requ.on('error', (e) => {
						// end 2
						globalAfIdsQueryCount --;
						console.log(`problem with request: ${e.message}`);
					});

					// write data to request body
					requ.end();
				})(options);
			});
		});
    });
}

function workFlowId2Id(entitiesId1,entitiesId2) {
    getReference(entitiesId1);
    
    var Id1 = parseInt(entitiesId1.Id);
    var Id2 = parseInt(entitiesId2.Id);
    
    var paths = getHopId2Id(entitiesId1,entitiesId2);
    
    var referenceIndex = 0;
    while(true) {
        if(globalReferenceQueryCount <= 0) {
            if(referenceIndex >= globalReferenceArray.length) {
                break;
            }
        } else {
            if(referenceIndex >= globalReferenceArray.length) {
                deasync.sleep(5);
				continue;
            }
        }
        
        while(referenceIndex < globalReferenceArray.length) {
            var entity = globalReferenceArray[referenceIndex];
            
            entitiesId = [entity];
            entitiesId['Id'] = entity.Id;
            var subPaths = getHopId2Id(entitiesId,entitiesId2);
            subPaths.forEach( (path) => {
                path.unshift(Id1);
                paths.push(path);
            });
            
            referenceIndex ++;
        }
    }
	
	
	var exprs = setExprRefsAuIds(globalReferenceArray,entitiesId1);
	getCitationPlus(entitiesId2,exprs);
    
    var citationIndex = 0;
    while(true) {
        if(globalCitationQueryCount <= 0) {
            if(citationIndex >= globalCitationArray.length) {
                break;
            }
        } else {
            if(citationIndex >= globalCitationArray.length) {
                deasync.sleep(5);
				continue;
            }
        }
        
        while(citationIndex < globalCitationArray.length) {
            var entity = globalCitationArray[citationIndex];
            
            entitiesId = [entity];
            entitiesId['Id'] = entity.Id;
            var subPaths = getHopId2Id(entitiesId1,entitiesId);
            subPaths.forEach( (path) => {
                path.push(Id2);
                paths.push(path);
            });
            
            citationIndex ++;
        }
    }
    
    // hops Id-Id-Id-Id
    var Ids = getEntitiesIds(globalCitationArray);
    globalReferenceArray.forEach((entity)=>{
        entity.RId.forEach((RId) => {
            if(Ids.hasOwnProperty(RId)) {
                paths.push([Id1,entity.Id,RId,Id2]);
                // console.log(`path: ${JSON.stringify(paths[paths.length-1])}`);
            }
        });
    });
    
    return paths;
}
// end   Id - Id

// begin Au - Id
function workFlowAu2Id(entitiesId1,entitiesId2) {
	
    var AfIds = getAuthorAfIds(entitiesId1);
	var exprs = setExprAfIds(AfIds.array);
	getAfIdsPlus(entitiesId2,exprs);
	
	if(entitiesId2[0].CC > 10) {
		var exprs = setExprRefs(entitiesId1);
		getCitationPlus(entitiesId2,exprs);
	} else {
		getCitation(entitiesId2);
	}
	
    var paths = [];
    
    var Id1 = parseInt(entitiesId1.Id);
    var Id2 = parseInt(entitiesId2.Id);
    
    // 1-hop
    entitiesId2.forEach((entity) => {
        entity.AA.forEach( (itemAA) => {
            if(itemAA.AuId === entitiesId1.Id) {
                paths.push([Id1,Id2]);
            }
        });
    });
    
    // hops au-id-..-id
    entitiesId1.forEach((entity)=>{
        // console.log(`RId : ${JSON.stringify(entity)}`);
        entitiesId = [entity];
        entitiesId['Id'] = entity.Id;
        var subPaths = getHopId2Id(entitiesId,entitiesId2);
        subPaths.forEach( (path) => {
            path.unshift(Id1);
            paths.push(path);
        });
    });
    
    // hops au-af-au-id
	var auIds = getEntityAuIds(entitiesId2[0]);
    var authorIndex = 0;
    // hops au-id-id-id
    var Ids = [];
    var citationIndex = 0;
    while(true) {
        if(globalAfIdsQueryCount <= 0 && globalCitationQueryCount <= 0) {
            if(authorIndex >= globalAuthorArray.length
				&& citationIndex >= globalCitationArray.length) {
                break;
            }
        } else {
            if(authorIndex >= globalAuthorArray.length
				&& citationIndex >= globalCitationArray.length) {
                deasync.sleep(5);
				continue;
            }
        }
        while(authorIndex < globalAuthorArray.length) {
            var AA = globalAuthorArray[authorIndex];
            if(AfIds.hasOwnProperty(AA.AfId) && auIds.hasOwnProperty(AA.AuId)) {
				paths.push([Id1,AA.AfId,AA.AuId,Id2]);
			}
            authorIndex ++;
        }
        while(citationIndex < globalCitationArray.length) {
            var entity = globalCitationArray[citationIndex];
            Ids[entity.Id] = 1;
            citationIndex ++;
        }
    }
    
    entitiesId1.forEach((entity)=>{
        entity.RId.forEach((RId) => {
            if(Ids.hasOwnProperty(RId)) {
                paths.push([Id1,entity.Id,RId,Id2]);
                // console.log(`path: ${JSON.stringify(paths[paths.length-1])}`);
            }
        });
    });
    
    return paths;
}
// end   Au - Id

// begin Id - Au
function workFlowId2Au(entitiesId1,entitiesId2) {
    getReference(entitiesId1);
	
    var AfIds = getAuthorAfIds(entitiesId2);
	var exprs = setExprAfIds(AfIds.array);
	getAfIdsPlus(entitiesId1,exprs);
    
    var paths = [];
    
    var Id1 = parseInt(entitiesId1.Id);
    var Id2 = parseInt(entitiesId2.Id);
    
    // 1-hop
    entitiesId1.forEach((entity) => {
        entity.AA.forEach( (itemAA) => {
            if(itemAA.AuId === entitiesId2.Id) {
                paths.push([Id1,Id2]);
            }
        });
    });
    
    // hops id-..-id-au
    entitiesId2.forEach((entity)=>{
        // console.log(`RId : ${JSON.stringify(entity)}`);
        entitiesId = [entity];
        entitiesId['Id'] = entity.Id;
        var subPaths = getHopId2Id(entitiesId1,entitiesId);
        subPaths.forEach( (path) => {
            path.push(Id2);
            paths.push(path);
        });
    });
    
    // hops id-au-af-au
	var auIds = getEntityAuIds(entitiesId1[0]);
    var authorIndex = 0;
    // hops id-id-id-au
    var Ids = getEntitiesIds(entitiesId2);
    var referenceIndex = 0;
    while(true) {
        if(globalAfIdsQueryCount <= 0 && globalReferenceQueryCount <= 0) {
            if(authorIndex >= globalAuthorArray.length
				&& referenceIndex >= globalReferenceArray.length) {
                break;
            }
        } else {
            if(authorIndex >= globalAuthorArray.length
				&& referenceIndex >= globalReferenceArray.length) {
                deasync.sleep(5);
				continue;
            }
        }
        while(authorIndex < globalAuthorArray.length) {
            var AA = globalAuthorArray[authorIndex];
            if(AfIds.hasOwnProperty(AA.AfId) && auIds.hasOwnProperty(AA.AuId)) {
				paths.push([Id1,AA.AuId,AA.AfId,Id2]);
			}
            authorIndex ++;
        }
		
        while(referenceIndex < globalReferenceArray.length) {
            var entity = globalReferenceArray[referenceIndex];
            
            if(entity.hasOwnProperty('RId')) {
                entity.RId.forEach((RId) => {
                    if(Ids.hasOwnProperty(RId)) {
                        paths.push([Id1,entity.Id,RId,Id2]);
                    }
                });
            }
            referenceIndex ++;
        }
    }
    
    return paths;
}
// end   Id - Au

// begin Au - Au
function workFlowAu2Au(entitiesId1,entitiesId2) {
    var paths = [];
    
    var Id1 = parseInt(entitiesId1.Id);
    var Id2 = parseInt(entitiesId2.Id);
    
    // hop Au - Id - Au
    var Ids = getEntitiesIds(entitiesId2);
    entitiesId1.forEach((entity) => {
        if(Ids.hasOwnProperty(entity.Id)) {
            paths.push([Id1,entity.Id,Id2]);
        }
    });
    
    // hop Au - Id - Id - Au
    entitiesId1.forEach((entity) => {
        if(entity.hasOwnProperty('RId')) {
            entity.RId.forEach( (RId) => {
                if(Ids.hasOwnProperty(RId)) {
                    paths.push([Id1,entity.Id,RId,Id2]);
                }
            });
        }
        if(Ids.hasOwnProperty(entity.Id)) {
            paths.push([Id1,entity.Id,Id2]);
        }
    });
    
    // hop Au - Af - Au
    var AfIds = getAuthorAfIds(entitiesId2);
    entitiesId1.forEach((entity) => {
		entity.AA.forEach( (item) => {
			if(item.AuId === entitiesId1.Id) {
				if(AfIds.hasOwnProperty(item.AfId)) {
					paths.push([Id1,item.AfId,Id2]);
				}
			}
		});
    });
    
    return paths;
}
// end   Au - Au

function pathsUnique(paths) {
    paths.sort();
        
    var res = [];
    
    for(var i = 0; i < paths.length; i++) {
        if(i === 0) {
            res.push(paths[i]);
            continue;
        }
        
        var isEqu = false;
        if(res[res.length-1].length === paths[i].length 
        && res[res.length-1].every( (u,j) => {
            return u === paths[i][j];
        })) {
            isEqu = true;
        }
        
        if(isEqu === false) {
            res.push(paths[i]);
        }
    }
    
    return res;
}

function workFlow(Id1,Id2,response2Client) {
    var arrayIds = getEntitiesId(Id1,Id2);
    
    var entitiesId1 = arrayIds[0];
    var entitiesId2 = arrayIds[1];
    
    entitiesId1['Id'] = Id1;
    entitiesId2['Id'] = Id2;
    
	// console.log(typeof(entitiesId1.Id));
	// console.log(typeof(entitiesId1[0].Id));
    console.log(`Id1 : ${entitiesId1.isAu} ${entitiesId1.length}`);
    console.log(`Id2 : ${entitiesId2.isAu} ${entitiesId2.length}`);
    // console.log(`Id1 : ${JSON.stringify(entitiesId1)}`);
    // console.log(`Id2 : ${JSON.stringify(entitiesId2)}`);
    
    var paths = [];
    
    if(entitiesId1.isAu) {
        if(entitiesId2.isAu) {
            paths = workFlowAu2Au(entitiesId1,entitiesId2);
        } else {
            paths = workFlowAu2Id(entitiesId1,entitiesId2);
        }
    } else  {
        if(entitiesId2.isAu) {
            paths = workFlowId2Au(entitiesId1,entitiesId2);
        } else {
            paths = workFlowId2Id(entitiesId1,entitiesId2);
        }
    }
    
    paths = pathsUnique(paths);
    var result = JSON.stringify(paths);
    response2Client.end(result);
    
    console.log(`paths.length: ${paths.length}`);
    // console.log(`result: ${result}`);
}

http.createServer(function(req, res) {
    timeLabel = req.url;
    console.time(timeLabel);
    // parse request
	console.log(req.url);
	var urlobj = url.parse(req.url,true);
	
    
	var Id1 = urlobj.query.id1;
	var Id2 = urlobj.query.id2;
    
    try {
        Id1 = parseInt(Id1.toString('utf-8').trim());
        Id2 = parseInt(Id2.toString('utf-8').trim());
    } catch(e) {
        res.end(JSON.stringify({Usage: "/?id2=189831743&id1=2147152072",err:e.stack}));
        console.timeEnd(timeLabel);
        return;
    }
    
    try {
        workFlow(Id1,Id2,res);
    } catch (e) {
		res.end(JSON.stringify({Usage: "/?id2=189831743&id1=2147152072",err:e.stack}));
        // throw e;
    }
    console.timeEnd(timeLabel);
}).listen(80);


