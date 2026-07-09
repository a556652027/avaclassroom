//  各種常用 呼叫 function
//
//
//
//
//
//
//

//=============================================================================
//   清除table 的 tbody
//   傳入 object
//=============================================================================
function ClearTableBody(obj) {
  // 先清除
  var tb = obj.getElementsByTagName("tbody");
  for (var i = 0; i < tb.length; i++) {
    obj.removeChild(tb[i]);
  }
}

//=============================================================================
//   Object 建立一個表格在 這一個區塊中
//
//   傳入 object
//=============================================================================
function create_JsonObjectToTable(obj, myJObject) {
  if (myJObject == null) return null;
  //var arr = [];
  // 判斷是不是一個 array
  if (Object.prototype.toString.call(myJObject) != "[object Object]") {
    return null;
  }

  var tbd = document.createElement("tbody");
  //var tbd = obj
  {
    var tr = document.createElement("tr");
    {
      var td = document.createElement("td");
      td.textContent = JSON.stringify(myJObject);
      tr.appendChild(td);
    }
    tbd.appendChild(tr);
  }
  obj.appendChild(tbd);
}

//=============================================================================
//   1DArray 建立一個表格在 這一個區塊中
//
//   傳入1D array
//=============================================================================
function create_Json1DArrayToTable(obj, my1DArray) {
  if (my1DArray == null) return null;
  //var arr = [];
  // 判斷是不是一個 array
  if (Object.prototype.toString.call(my1DArray) != "[object Array]") {
    return null;
  }

  var tbd = document.createElement("tbody");
  //var tbd = obj;
  {
    var tr = document.createElement("tr");
    for (var i = 0; i < my1DArray.length; i++) {
      //console.log(Object.prototype.toString.call(my1DArray[i]));  //"[object Array]"
      {
        var td = document.createElement("td");
        if (Object.prototype.toString.call(my1DArray[i]) == "[object Object]") {
          create_JsonObjectToTable(td, my1DArray[i]);
        } else {
          td.textContent = my1DArray[i];
        }
        tr.appendChild(td);
      }
    }
    tbd.appendChild(tr);
  }
  obj.appendChild(tbd);
}

//=============================================================================
//   2D陣列 建立一個表格在 這一個區塊中
//   <table id="TablePlace" border="1"><tr><td>這是表格</td></tr></table>建立一個表格再
//   傳入2D array
//=============================================================================
function create_Json2DArrayToTable(obj, my2DArray) {
  if (my2DArray == null) return null;
  //var arr = [];
  // 判斷是不是一個 array
  if (Object.prototype.toString.call(my2DArray) != "[object Array]") {
    return null;
  }

  // 先清除
  ClearTableBody(obj);

  var tbd = document.createElement("tbody");
  //var tbd = obj;

  for (var i = 0; i < my2DArray.length; i++) {
    var item = my2DArray[i];
    var tr = document.createElement("tr");
    for (var j = 0; j < item.length; j++) {
      var td = document.createElement("td");
      td.style.padding = "1rem";
      if (Object.prototype.toString.call(item[j]) == "[object Object]") {
        create_JsonObjectToTable(td, item[j]);
      } else if (Object.prototype.toString.call(item[j]) == "[object Array]") {
        create_Json1DArrayToTable(td, item[j]);
      } else {
        td.textContent = item[j];
      }
      tr.appendChild(td);
    }
    tbd.appendChild(tr);
  }

  obj.appendChild(tbd);
  return tbd;
}

//=============================================================================
//   2D陣列 建立一個select在 這一個區塊中
//   <select name="number" id="number">建立一個select再
//   傳入2D array
//=============================================================================
function create_JsonArrayToSelect(selectobj, myArray, onchangedcb) {
  selectobj.onchange = onchangedcb;
  for (var i = 0; i < myArray.length; i++) {
    selectobj.add(new Option(myArray[i][0], i), null);
  }
}

//=============================================================================
//
// 取得select的option
//=============================================================================
function get_selected_option(select_obj) {
  if (select_obj.length <= 0) return null;
  if (
    select_obj.selectedIndex < 0 ||
    select_obj.selectedIndex >= select_obj.length
  )
    return null;
  return select_obj.options[select_obj.selectedIndex];
}

function get_selected_option_value(select_obj) {
  var option = get_selected_option(select_obj);
  if (option != null) return option.value;
  return "";
}

//=============================================================================
//
// 將 option value 為 value 的選項設置為被選
//=============================================================================
function set_select_option_by_value(select_obj, value) {
  for (var i = 0; i < select_obj.options.length; i++) {
    if (select_obj.options[i].value == value) {
      select_obj.options[i].selected = true;
      return true;
    }
  }
  return false;
}

//=============================================================================
//
// 清除表單內的資料
//=============================================================================
function initalize_page_value(obj) {
  if (obj.hasChildNodes()) {
    var children = obj.childNodes;

    for (var i = 0; i < children.length; i++) {
      initalize_page_value(children[i]);
    }
  } else {
    if (
      obj.type == "text" ||
      obj.type == "textarea" ||
      obj.type == "number" ||
      obj.type == "tel"
    ) {
      obj.value = "";
    }
  }
}

//=============================================================================
//
// 拖放檔案上傳
//=============================================================================
(function (global) {
  function EnableDragFile(opts) {
    const cfg = Object.assign(
      {
        scope: document,
        cssScope: "",
        dropzone: null,
        fileInput: null,
        listEl: null,
        clickToSelect: true,
        multiple: true,
        globalGuard: true,
        accept: null,
        maxFiles: null,
        maxTotalBytes: null,
        onChange: null,
        onError: null,
        highlightClass: "highlight",
      },
      opts || {},
    );

    const scopeEl =
      typeof cfg.scope === "string"
        ? document.querySelector(cfg.scope)
        : cfg.scope || document;
    if (!scopeEl)
      throw new Error("[EnableDragFile] scope not found: " + cfg.scope);
    const $ = (selOrEl) =>
      typeof selOrEl === "string" ? scopeEl.querySelector(selOrEl) : selOrEl;

    const dz = $(cfg.dropzone);
    if (!dz) throw new Error("[EnableDragFile] dropzone not found in scope");

    let input = $(cfg.fileInput);
    const usingOverlay = !input;
    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      dz.appendChild(input);
      dz.style.position = dz.style.position || "relative";
      input.style.position = "absolute";
      input.style.inset = "0";
      input.style.width = "100%";
      input.style.height = "100%";
      input.style.opacity = "0";
      input.style.zIndex = "2";
      input.style.display = "block";
    }
    input.multiple = !!cfg.multiple;
    if (typeof cfg.accept === "string") input.accept = cfg.accept;

    const listEl = $(cfg.listEl);

    let removeGlobalGuard = () => {};
    if (cfg.globalGuard) {
      const prevent = (e) => e.preventDefault();
      window.addEventListener("dragover", prevent, {
        capture: true,
        passive: false,
      });
      window.addEventListener("drop", prevent, {
        capture: true,
        passive: false,
      });
      document.addEventListener("dragover", prevent, {
        capture: true,
        passive: false,
      });
      document.addEventListener("drop", prevent, {
        capture: true,
        passive: false,
      });
      removeGlobalGuard = () => {
        window.removeEventListener("dragover", prevent, { capture: true });
        window.removeEventListener("drop", prevent, { capture: true });
        document.removeEventListener("dragover", prevent, { capture: true });
        document.removeEventListener("drop", prevent, { capture: true });
      };
    }

    (function injectCSSOnce() {
      const prefix = cfg.cssScope ? cfg.cssScope.trim() + " " : "";
      const key = `data-upload-css-${btoa(prefix).replace(/=+$/, "")}`;
      if (document.querySelector(`style[${key}]`)) return;
      const css = `
${prefix}#dropzone.dropzone,
${prefix}#dropzone-update.dropzone{
  border:2px dashed #3b82f6;border-radius:12px;padding:24px;min-height:140px;
  background:#f8fafc;color:#334155;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;
  cursor:pointer;user-select:none;
}
${prefix}#dropzone.dropzone.${cfg.highlightClass},
${prefix}#dropzone-update.dropzone.${cfg.highlightClass}{background:#eff6ff;border-color:#2563eb}
${prefix}#fileList,
${prefix}#fileList-update{margin-top:8px;font-size:13px;color:#475569}
      `.trim();
      const el = document.createElement("style");
      el.setAttribute(key, "true");
      el.textContent = css;
      document.head.appendChild(el);
    })();

    let picked = [];
    const human = (n) => {
      const u = ["B", "KB", "MB", "GB", "TB"];
      let i = 0;
      while (n >= 1024 && i < u.length - 1) {
        n /= 1024;
        i++;
      }
      return n.toFixed(1) + " " + u[i];
    };

    const render = () => {
      if (!listEl) return;
      if (!picked.length) {
        listEl.innerHTML = "";
        return;
      }
      listEl.innerHTML = picked
        .map(
          (f, i) => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; margin-bottom:6px; background-color:#e6f1fd; border-radius:6px; border:1px solid #9caec7ff;">
                    <div style="display:flex; align-items:center; gap:8px; flex:1;">
                        <img src="assets/images/list_information.svg" alt="" style="width:16px; height:16px;" />
                        <span style="font-size:14px; color:#404040; font-weight:500;">${escapeHTML(f.name)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; color:#6b7280;">${human(f.size)}</span>
                        <span class="remove-file-btn" data-index="${i}" style="cursor: pointer; font-weight: bold; color: #ff0000; margin-left: 10px; padding: 5px; position: relative; z-index: 3;">x</span>
                    </div>
                </div>
            `,
        )
        .join("");
    };

    if (listEl) {
      listEl.addEventListener("click", function (e) {
        if (e.target && e.target.classList.contains("remove-file-btn")) {
          e.stopPropagation();
          const index = parseInt(e.target.getAttribute("data-index"), 10);
          if (!isNaN(index) && index >= 0 && index < picked.length) {
            picked.splice(index, 1);

            // 同步更新 input.files
            const dt = new DataTransfer();
            for (const file of picked) {
              dt.items.add(file);
            }
            input.files = dt.files;

            render();
            cfg.onChange &&
              cfg.onChange(picked, { source: "remove", scope: scopeEl });
          }
        }
      });
    }

    function applyFilters(arr) {
      let files = Array.from(arr || []);
      if (typeof cfg.accept === "function") files = files.filter(cfg.accept);
      if (cfg.maxFiles && files.length > cfg.maxFiles) {
        cfg.onError && cfg.onError(`最多 ${cfg.maxFiles} 個檔案`);
        files = files.slice(0, cfg.maxFiles);
      }
      if (cfg.maxTotalBytes) {
        const t = files.reduce((s, f) => s + (f.size || 0), 0);
        if (t > cfg.maxTotalBytes)
          cfg.onError &&
            cfg.onError(
              `總大小 ${human(t)} 超過上限 ${human(cfg.maxTotalBytes)}`,
            );
      }
      return files;
    }

    function setFiles(arr, source) {
      const newFiles = Array.from(arr || []);
      const uniqueNewFiles = newFiles.filter(
        (newFile) =>
          !picked.some(
            (existingFile) =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified,
          ),
      );

      if (uniqueNewFiles.length === 0 && newFiles.length > 0) {
        if (cfg.onError) cfg.onError("選擇的檔案已存在。");
      }

      let combinedFiles = picked.concat(uniqueNewFiles);
      picked = applyFilters(combinedFiles);

      // 同步更新 input.files
      const dt = new DataTransfer();
      for (const file of picked) {
        dt.items.add(file);
      }
      input.files = dt.files;

      render();

      if (uniqueNewFiles.length) {
        const names = uniqueNewFiles.map((f) => f.name).join(", ");
        console.log(
          source === "drop"
            ? `拖曳 [ ${names} ] 成功`
            : `選擇檔案 [ ${names} ] 成功`,
        );
      }

      cfg.onChange && cfg.onChange(picked, { source, scope: scopeEl });
    }

    if (cfg.clickToSelect && !usingOverlay) {
      dz.addEventListener("click", () => input.click());
    }

    ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) =>
      dz.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }),
    );
    dz.addEventListener("dragover", (e) => {
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      dz.classList.add(cfg.highlightClass);
    });
    ["dragleave", "drop"].forEach((evt) =>
      dz.addEventListener(evt, () => dz.classList.remove(cfg.highlightClass)),
    );

    dz.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt?.files?.length
        ? Array.from(dt.files)
        : dt?.items?.length
          ? Array.from(dt.items)
              .filter((it) => it.kind === "file")
              .map((it) => it.getAsFile())
              .filter(Boolean)
          : [];
      if (files.length) setFiles(files, "drop");
      else cfg.onError && cfg.onError("未偵測到檔案（可能是拖了資料夾）");
    });

    input.addEventListener("change", (e) =>
      setFiles(e.target.files || [], "input"),
    );

    return {
      getFiles: () => picked.slice(),
      clear: () => {
        picked = [];
        input.value = "";
        render();
        cfg.onChange &&
          cfg.onChange(picked, { source: "clear", scope: scopeEl });
      },
      setFiles: (files) => setFiles(files, "api"),
      toFormData: (field = "files[]", params = {}) => {
        const f = new FormData();
        Object.entries(params).forEach(([k, v]) => f.append(k, v));
        picked.forEach((file, i) =>
          f.append(field, file, file.name || `file_${i}`),
        );
        return f;
      },
      destroy: () => {
        removeGlobalGuard();
      },
    };
  }
  global.EnableDragFile = EnableDragFile;
})(window);
