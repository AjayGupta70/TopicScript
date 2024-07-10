const mongoose = require('mongoose');

let activityMonitors = require('./../dev.activitymonitors.json');
let courseV2 = require('./../dev.coursev2.json');
let courseResp = require('./../dev.courseresponses.json');


let finalResp = [];
let schemaObj = {
    "userId": "",
    "type": "topic-completed",
    "createdAt": "ISO Datetime string",
    "details": {
        "courseId": "",
        "courseName": "",
        "courseVersion": "",
        "topicId": "",
        "topicName": "",
        "topicStartedAt": "",
        "topicCompletedAt": ""
    }
}
for (let activityMonitor of activityMonitors) {
    if (activityMonitor.activityType != 'topicCompleted') continue;
    let respObj = Object.assign({}, schemaObj);
    respObj.userId = activityMonitor.userId;
    respObj.createdAt = activityMonitor.createdAt;
    let topicId = (!!activityMonitor.attribute && !!activityMonitor.attribute.topicId) ? (activityMonitor.attribute.topicId["$oid"] ??activityMonitor.attribute.topicId) : "";
    let checkCoursePresent = false;
    for (let course of courseV2) {
        // for (let content of course.content ?? []) {
        //     if (topicId != content._id["$oid"]) continue;
        //     respObj.details.topicId = content.id;
        //     respObj.details.topicName = content.name;
        // }
        topic(course.content ?? [], topicId, respObj)
        if (activityMonitor.activityId == course.courseId) {
            respObj.details.courseId = course.courseId;
            respObj.details.courseName = course.name;
            checkCoursePresent = true;
        }
    }
    if (checkCoursePresent) {
        for (let course of courseResp) {
            if (activityMonitor.userId == course.userId && course.courseId == respObj.details.courseId) {
                respObj.details.topicStartedAt = !!course.beginDate ? course.beginDate['$date'] : "";
                respObj.details.topicCompletedAt = !!course.completionDate ? course.completionDate['$date'] : "";
            }
        }
    }
    finalResp.push(respObj);
}
function topic(obj, topicId, respObj){
            let keys = Object.keys({},obj);
            for(let it=0;it<keys.length;it++){
                if(keys[it] == 'content') topic(obj[keys[it]]);
                if(keys[it] == '_id' && topicId == obj._id["$oid"]){
                    respObj.details.topicId = obj.id;
                    respObj.details.topicName = obj.name;
                    return;
                }
            }
            return;
        }
console.log(finalResp);