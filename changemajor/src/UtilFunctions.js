import queryString from 'query-string';
import isEmpty from 'lodash.isempty';

const SERVICE_URL = "http://catalog-lb-957775361.us-west-2.elb.amazonaws.com/course-catalog/api/v1/search"
const UtilFunctions = {
    SERVICE_URL:SERVICE_URL,
    //gets url, and returns object with all url fields
    parseUrl(url) {
        var parsed = queryString.parse(url);
        parsed.hasFilter = hasFilter(parsed)
        return parsed
    },

    getClassSearchUrl(params){
        console.log(SERVICE_URL + "/classes?&refine=Y&" + queryString.stringify(params))
        return SERVICE_URL + "/classes?&refine=Y&" + queryString.stringify(params)
    },

    getCourseSearchUrl(params){
        console.log(SERVICE_URL+"/courses?&refine=Y&" + queryString.stringify(params))
        return SERVICE_URL+"/courses?&refine=Y&" + queryString.stringify(params);
    },
    getTermListUrl(){
        
        return SERVICE_URL + "/terms"
    },
    getSubjectListUrl(term){
        
        return SERVICE_URL+"/subjects?term="+term
    },
    getSubjectSimpleListUrl(term){
        
        return SERVICE_URL+"/subjects?sl=Y&term="+term
    },
    getQueryString(data) {
        var params = {
            term: data.term != null ? data.term : "2197"
        }
        params.searchType = data.searchType != null ? data.searchType : "all"
        params.campusOrOnlineSelection= data.campusOrOnlineSelection != null ? data.campusOrOnlineSelection : "C"

        if(data.keywords != null)
            params.keywords = data.keywords

        if(data.college != null)
            params.college = data.college

        if(data.campus != null)
            params.campus  = data.campus 

        if(data.session != null)
            params.session = data.session 
        
        if(data.level != null)
            params.level = data.level 

        if(data.daysOfWeek != null)
            params.daysOfWeek = data.daysOfWeek 
    
        return queryString.stringify(params)
    },
    getCourseQueryString(data) {
        var params = {
            term: data.term != null ? data.term : "2197"
        }
        params.searchType = data.searchType != null ? data.searchType : "all"
        //params.campusOrOnlineSelection= data.campusOrOnlineSelection != null ? data.campusOrOnlineSelection : "C"

        if(data.keywords != null)
            params.keywords = data.keywords

        if(data.college != null)
            params.college = data.college

        // if(data.campus != null)
        //     params.campus  = data.campus 

        if(data.session != null)
            params.session = data.session 
        
        if(data.level != null)
            params.level = data.level 

        if(data.daysOfWeek != null)
            params.daysOfWeek = data.daysOfWeek 
    
        return queryString.stringify(params)
    },

    getQueryStringFromState(data) {
        const params = {
            term: isEmpty(data.term) ? "2191" : data.term ,
            subject: isEmpty(data.subject ) ? undefined : data.subject ,
            catalogNbr: isEmpty(data.catalogNbr ) ?  undefined : data.catalogNbr ,
            searchType: isEmpty(data.searchType ) ?  "all" :data.searchType ,
            keywords: isEmpty(data.keywords ) ?  undefined : data.keywords ,
            college: isEmpty(data.college ) ?  undefined : data.college ,
            campus: isEmpty(data.campus ) ?  undefined : data.campus.join(","),
            session: isEmpty(data.session ) ?  undefined : data.session.join(",") ,
            campusOrOnlineSelection: isEmpty(data.campusOrOnlineSelection ) ?  "C" : data.campusOrOnlineSelection,
            gen_studies:isEmpty(data.gs ) ? undefined : data.gs.join(",") ,
            instructorName: isEmpty(data.instructor ) ?  undefined : data.instructor,
            level: isEmpty(data.level ) ? undefined : data.level ,
            classNbr: isEmpty(data.classNbr ) ? undefined : data.classNbr ,
            promod: data.promod ? "T" : "F" ,
            hon : data.honors ? "T" : "F" ,
            honorsEnrichmentContracts: data.honors ? false : undefined,
            units: isEmpty(data.units ) ? undefined : data.units ,
            daysOfWeek: isEmpty(data.daysOfWeek ) ? undefined : data.daysOfWeek.join(",") ,
            startDate: isEmpty(data.startDate ) ? undefined : data.startDate ,
            endDate: isEmpty(data.endDate ) ? undefined : data.endDate ,
            startTime: isEmpty(data.startTime ) ? undefined : data.startTime ,
            endTime: isEmpty(data.endTime ) ? undefined : data.endTime ,

        }
    
        return queryString.stringify(params)
    },
    getCatalogQueryStringFromState(data) {
        const params = {
            term: isEmpty(data.term) ? "2197" : data.term ,
            subject: isEmpty(data.subject ) ? undefined : data.subject ,
            catalogNbr: isEmpty(data.catalogNbr ) ?  undefined : data.catalogNbr ,
            // searchType: isEmpty(data.searchType ) ?  "all" :data.searchType ,
            keywords: isEmpty(data.keywords ) ?  undefined : data.keywords ,
            college: isEmpty(data.college ) ?  undefined : data.college ,
            campus: isEmpty(data.campus ) ?  undefined : data.campus.join(","),
            session: isEmpty(data.session ) ?  undefined : data.session.join(",") ,
            //campusOrOnlineSelection: isEmpty(data.campusOrOnlineSelection ) ?  "C" : data.campusOrOnlineSelection,
            gen_studies:isEmpty(data.gs ) ? undefined : data.gs.join(",") ,
            instructorName: isEmpty(data.instructor ) ?  undefined : data.instructor,
            level: isEmpty(data.level ) ? undefined : data.level ,
            classNbr: isEmpty(data.classNbr ) ? undefined : data.classNbr ,
            // promod: data.promod ? "T" : "F" ,
            // hon : data.honors ? "T" : "F" ,
            honorsEnrichmentContracts: data.honors ? false : undefined,
            units: isEmpty(data.units ) ? undefined : data.units ,
            daysOfWeek: isEmpty(data.daysOfWeek ) ? undefined : data.daysOfWeek.join(",") ,
            startDate: isEmpty(data.startDate ) ? undefined : data.startDate ,
            endDate: isEmpty(data.endDate ) ? undefined : data.endDate ,
            startTime: isEmpty(data.startTime ) ? undefined : data.startTime ,
            endTime: isEmpty(data.endTime ) ? undefined : data.endTime ,
            collapse: isEmpty(data.collapse ) ? undefined : true ,

        }
    
        return queryString.stringify(params)
    },
     async getProcessedTermList(fullTermList){
        var finalList = []
        for (let index = 0; index < fullTermList.length; index++) {
            const element = fullTermList[index];
            finalList.push({value:element.term,label:element.descr})
        }
        return finalList
    },
    async getProcessedCurrentTerm(fullTermList,currentTerm){
        const term = await fullTermList.find(item => {
                return item.term === currentTerm
        })
        
        
      
       return await this.getProcessedTermList([term])
   },
   arraysAreEqual(a1,a2){
       if(a1 !== undefined && a2 !== undefined){
           return JSON.stringify(a1) === JSON.stringify(a2)
       }
       return false
   },
    isEmpty(s) {
        return s === null || s.length === 0;
    }

  

    
}

export default UtilFunctions;


//check if url object includes any filters
function hasFilter(obj){
    if("campus" in obj 
        || "college" in obj
        || "session" in obj  )
        return true

    return false
}





