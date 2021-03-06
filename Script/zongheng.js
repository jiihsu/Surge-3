/**
 *  @author: Peng-YM
 *  更新地址: https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/zongheng.js
 *  使用方法：进入纵横小说页面，例如<<剑来>>：http://book.zongheng.com/book/672340.html 则id为672340，将id添加到列表即可。
 */

// 书籍id列表
const ids = ["672340", "685640", "408586", "411993"];
const alwaysNotice = false; // 设置为true则每次运行通知，否则只通知更新

/********************************* SCRIPT START *******************************************************/
const $ = API("zongheng");

const parsers = {
  title: new RegExp(/bookname="(\S+)"/, "i"),
  latestChapter: new RegExp(/class="tit"><a[^>]*>([^<]*)/, "i"),
  coverURL: new RegExp(
    /<div class="book-img fl">[\s\S]*?<img src="(.*?)".*>[\s\S]*?<\/div>/
  ),
  description: new RegExp(/<div class="con">([\s\S]*?)<\/div>/),
  updateTime: new RegExp(/(\d+)(?:小时|天)前/),
  updateCount: new RegExp(/今日更新\d+章/),
  author: new RegExp(/<div class="au-name"><a [\s\S]*?>(\S*)<\/a><\/div>/),
};
// check update
checkUpdate($.read("books") || {}).finally(() => $.done());

async function checkUpdate(books) {
  await Promise.all(
    ids.map(async (id) => {
      $.log(`Handling book with id: ${id}...`);
      // check update from each book
      const config = {
        url: `http://book.zongheng.com/book/${id}.html`,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
        },
      };

      await $.get(config)
        .then((response) => {
          const html = response.body;
          // parse html
          const book = {
            title: html.match(parsers.title)[1],
            updateCount: html.match(parsers.updateCount)[0],
            latestChapter: html.match(parsers.latestChapter)[1],
            coverURL: html.match(parsers.coverURL)[1],
            updateTime: html.match(parsers.updateTime)[0],
            description: html.match(parsers.description)[1],
            author: html.match(parsers.author)[1],
          };
          $.log(book);
          const cachebook = books[id];
          if (
            cachebook === undefined ||
            alwaysNotice ||
            latestChapter !== cachebook.latestChapter
          ) {
            // upate database
            books[id] = book;
            // push notifications
            $.notify(
              `🎉🎉🎉[纵横小说] 《${book.title}》更新`,
              `⏰ 更新时间: ${book.updateTime}`,
              `🎩作者: ${book.author}\n📌 最新章节: ${book.latestChapter}\n${book.description}\n⌨️ ${book.updateCount}`,
              {
                "open-url": `http://book.zongheng.com/book/${id}.html`,
                "media-url": book.coverURL,
              }
            );
          }
        })
        .catch((e) => $.error(e));
    })
  );

  // update database
  $.write(books, "books");
}
/********************************* SCRIPT END *******************************************************/

// prettier-ignore
/*********************************** API *************************************/
function API(t="untitled",e=!1){return new class{constructor(t,e){this.name=t,this.debug=e,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(t){return this.then(function(e){return((t,e)=>new Promise(function(s){setTimeout(s.bind(null,e),t)}))(t,e)})}}get(t){return this.isQX?("string"==typeof t&&(t={url:t,method:"GET"}),$task.fetch(t)):new Promise((e,s)=>{this.isLoon||this.isSurge?$httpClient.get(t,(t,i,o)=>{t?s(t):e({...i,body:o})}):this.node.request(t,(t,i,o)=>{t?s(t):e({...i,status:i.statusCode,body:o})})})}post(t){return this.isQX?("string"==typeof t&&(t={url:t}),t.method="POST",$task.fetch(t)):new Promise((e,s)=>{this.isLoon||this.isSurge?$httpClient.post(t,(t,i,o)=>{t?s(t):e({...i,body:o})}):this.node.request.post(t,(t,i,o)=>{t?s(t):e({...i,status:i.statusCode,body:o})})})}initCache(){if(this.isQX)return JSON.parse($prefs.valueForKey(this.name)||"{}");if(this.isLoon||this.isSurge)return JSON.parse($persistentStore.read(this.name)||"{}");if(this.isNode){const t=`${this.name}.json`;return this.node.fs.existsSync(t)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(t,JSON.stringify({}),{flag:"wx"},t=>console.log(t)),{})}}persistCache(){const t=JSON.stringify(this.cache);this.log(`FLUSHING DATA:\n${t}`),this.isQX&&$prefs.setValueForKey(t,this.name),(this.isLoon||this.isSurge)&&$persistentStore.write(t,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,t,{flag:"w"},t=>console.log(t))}write(t,e){this.log(`SET ${e} = ${t}`),this.cache[e]=t,this.persistCache()}read(t){return this.log(`READ ${t} ==> ${this.cache[t]}`),this.cache[t]}delete(t){this.log(`DELETE ${t}`),delete this.cache[t],this.persistCache()}notify(t,e,s,i){const o="string"==typeof i?i:void 0,n=s+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(t,e,s,{"open-url":o}):$notify(t,e,s,i)),this.isSurge&&$notification.post(t,e,n),this.isLoon&&$notification.post(t,e,s),this.isNode&&("undefined"==typeof $jsbox?console.log(`${t}\n${e}\n${n}\n\n`):require("push").schedule({title:t,body:e?e+"\n"+s:s}))}log(t){this.debug&&console.log(t)}info(t){console.log(t)}error(t){this.log("ERROR: "+t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){this.log("DONE"),this.isNode||$done(t)}}(t,e)}
/*****************************************************************************/
