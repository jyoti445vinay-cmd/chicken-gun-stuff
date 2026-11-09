// ==UserScript==
// @name         Scratch Editor Mod
// @namespace    local.scratch.mod
// @version      1.0
// @description  Dark theme, accent color picker and small UI tweaks for the Scratch editor
// @match        https://scratch.mit.edu/projects/*
// @match        https://turbowarp.org/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const KEY = 'scratchMod.settings';
  const defaults = { dark: true, accent: '#7c5cff', compact: false };

  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return Object.assign({}, defaults); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) {}
  }

  const settings = load();

  // Scratch uses hashed CSS-module class names (e.g. menu-bar_menu-bar_xxxx),
  // so we match on stable substrings with [class*="..."].
  const style = document.createElement('style');
  style.id = 'scratch-mod-style';
  document.head.appendChild(style);

  function buildCss() {
    let css = '';

    if (settings.dark) {
      css += `
        body, [class*="gui_page-wrapper"], [class*="gui_body-wrapper"] { background: #16161d !important; }
        [class*="gui_menu-bar-position"] { background: ${settings.accent} !important; }
        [class*="menu-bar_menu-bar_"] { background: ${settings.accent} !important; }
        [class*="gui_stage-and-target-wrapper"],
        [class*="gui_target-wrapper"],
        [class*="target-pane_target-pane"],
        [class*="sprite-selector_sprite-selector"],
        [class*="stage-selector_stage-selector"] { background: #1e1e28 !important; }
        [class*="sprite-info_sprite-info"], [class*="sprite-selector-item_sprite-selector-item"] {
          background: #272734 !important; color: #e8e8f0 !important; border-color: #3a3a4d !important;
        }
        [class*="gui_tab-list"] [class*="react-tabs_react-tabs__tab"] {
          background: #272734 !important; color: #cfcfe0 !important; border-color: #3a3a4d !important;
        }
        [class*="react-tabs_react-tabs__tab--selected"] {
          background: #1e1e28 !important; color: #fff !important;
          border-bottom: 3px solid ${settings.accent} !important;
        }
        [class*="gui_editor-wrapper"], [class*="gui_tabs"] { background: #16161d !important; }
        .blocklyMainBackground { fill: #1b1b24 !important; }
        .blocklyToolboxDiv { background: #1e1e28 !important; }
        .blocklyFlyoutBackground { fill: #252533 !important; fill-opacity: 1 !important; }
        .blocklyScrollbarHandle { fill: #4a4a60 !important; }
        [class*="stage-header_stage-header-wrapper"] { background: #1e1e28 !important; }
        input, select, textarea { color-scheme: dark; }
      `;
    } else {
      css += `
        [class*="menu-bar_menu-bar_"] { background: ${settings.accent} !important; }
      `;
    }

    if (settings.compact) {
      css += `
        [class*="menu-bar_menu-bar_"] { height: 2.8rem !important; }
        [class*="sprite-selector-item_sprite-selector-item"] { transform: scale(0.9); }
        [class*="blocks_blocks"] .blocklyText { font-size: 11pt !important; }
      `;
    }

    return css;
  }

  function apply() {
    style.textContent = buildCss();
    updatePanel();
  }

  // ---- Floating settings panel ----
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed', 'right:12px', 'bottom:12px', 'z-index:99999',
    'font:13px system-ui,sans-serif', 'color:#fff',
    'background:rgba(30,30,40,0.95)', 'border:1px solid #444',
    'border-radius:10px', 'padding:8px 10px', 'box-shadow:0 4px 16px rgba(0,0,0,.4)',
    'user-select:none'
  ].join(';');

  panel.innerHTML = `
    <div id="sm-head" style="cursor:pointer;font-weight:600">🎨 Mod</div>
    <div id="sm-body" style="display:none;margin-top:8px;line-height:2">
      <label><input type="checkbox" id="sm-dark"> Dark theme</label><br>
      <label><input type="checkbox" id="sm-compact"> Compact UI</label><br>
      <label>Accent <input type="color" id="sm-accent" style="vertical-align:middle"></label><br>
      <button id="sm-reset" style="margin-top:4px">Reset</button>
    </div>`;
  document.body.appendChild(panel);

  const $ = (id) => panel.querySelector('#' + id);

  function updatePanel() {
    $('sm-dark').checked = settings.dark;
    $('sm-compact').checked = settings.compact;
    $('sm-accent').value = settings.accent;
  }

  $('sm-head').addEventListener('click', () => {
    const b = $('sm-body');
    b.style.display = b.style.display === 'none' ? 'block' : 'none';
  });
  $('sm-dark').addEventListener('change', (e) => { settings.dark = e.target.checked; save(); apply(); });
  $('sm-compact').addEventListener('change', (e) => { settings.compact = e.target.checked; save(); apply(); });
  $('sm-accent').addEventListener('input', (e) => { settings.accent = e.target.value; save(); apply(); });
  $('sm-reset').addEventListener('click', () => {
    Object.assign(settings, defaults); save(); apply();
  });

  // Shortcut: Alt+D toggles dark theme
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'd') {
      settings.dark = !settings.dark; save(); apply();
    }
  });

  apply();
})();
