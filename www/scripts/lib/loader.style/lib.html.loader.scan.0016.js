// 插入loading 的 dialog
// class 切換不同類型
// https://cssloaders.github.io/

// 動態寫入 相對目錄下的 css
let work_dir = document.currentScript.src;
work_dir = work_dir.substring(0, work_dir.lastIndexOf("/"));
let css_dir = work_dir + "/css/loader.scan.0016.css";
let link = document.createElement("link");
link.rel = "stylesheet";
link.href = css_dir;
document.head.appendChild(link);

//document.write('<link rel="stylesheet" href="css/loader.style/loader.circle.11.css"/>')

// <span class="polar_bear"></span>
// document.write('<link rel="stylesheet" href="css/loader.style/loader.polar_bear.03.css"/>')

// <span class="rotating"></span>
// document.write('<link rel="stylesheet" href="css/loader.style/loader.rotating.07.css"/>')

// <span class="water"></span>
//document.write('<link rel="stylesheet" href="css/loader.style/loader.water.css"/>')

// <span class="scan"></span>

//document.write(`<link rel="stylesheet" href="${css_dir}"/>`);

// <span class="loader"></span>
//document.write('<link rel="stylesheet" href="css/loader.style/loader.newtloader.newton_cradle.05.css"/>')

// 建立一個 loader 的元素
// function CreateLoaderElement() {
//     if (!document.querySelector('.loader')) {
//         const loader = document.createElement('section')
//         loader.className = 'loader'
//         //loader.innerHTML = '<span class="loader"></span>'
//         loader.innerHTML = `<span class="loader">
//          <div class="scan">
//             <div class="fingerprint"></div>
//               <span class="loading-text">Loading...</span>
//             </div>
//         </span>
//         `
//         document.body.appendChild(loader)
//     }
// }

// 開啟/關閉 一個 loading 的元素
// 改成沒有會自動建立
function VisibleLoaderElement(is_visible) {
  var loader = document.querySelector(".loader");
  if (!loader) {
    loader = document.createElement("section");
    loader.className = "loader";
    //loader.innerHTML = '<span class="loader"></span>'
    loader.innerHTML = `
      <span class="">
          <div class="scan">
              <img src="assets/images/Group (3).svg" alt="" style="width: 300px; height:      
  300px; margin-bottom: 20px;">
              <div class="fingerprint">
                  <span class="loading-text" style="font-size: 60px ">Loading...</span>
              </div>
          </div>
      </span>
  `;
    document.body.appendChild(loader);
  }

  if (loader) {
    if (is_visible) {
      loader.style.display = "block";
    } else {
      loader.style.display = "none";
    }
  }
}
