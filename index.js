(function (e, t) {
    let n = e.amplitude || {_q: [], _iq: {}};
    let r = t.createElement("script");
    r.type = "text/javascript";
    r.integrity = "sha384-tzcaaCH5+KXD4sGaDozev6oElQhsVfbJvdi3//c2YvbY02LrNlbpGdt3Wq4rWonS";
    r.crossOrigin = "anonymous";
    r.async = true;
    r.src = "https://cdn.amplitude.com/libs/amplitude-8.5.0-min.gz.js";
    r.onload = function () {
        if (!e.amplitude.runQueuedFunctions) {
            console.log("[Amplitude] Error: could not load SDK");
        }
    };
    let i = t.getElementsByTagName("script")[0];
    i.parentNode.insertBefore(r, i);

    function s(e, t) {
        e.prototype[t] = function () {
            this._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
            return this;
        };
    }

    let o = function () {
        this._q = [];
        return this;
    };
    let a = ["add", "append", "clearAll", "prepend", "set", "setOnce", "unset", "preInsert", "postInsert", "remove"];
    for (let c = 0; c < a.length; c++) {
        s(o, a[c]);
    }
    n.Identify = o;
    let u = function () {
        this._q = [];
        return this;
    };
    let l = ["setProductId", "setQuantity", "setPrice", "setRevenueType", "setEventProperties"];
    for (let p = 0; p < l.length; p++) {
        s(u, l[p]);
    }
    n.Revenue = u;
    let d = [
        "init",
        "logEvent",
        "logRevenue",
        "setUserId",
        "setUserProperties",
        "setOptOut",
        "setVersionName",
        "setDomain",
        "setDeviceId",
        "enableTracking",
        "setGlobalUserProperties",
        "identify",
        "clearUserProperties",
        "setGroup",
        "logRevenueV2",
        "regenerateDeviceId",
        "groupIdentify",
        "onInit",
        "logEventWithTimestamp",
        "logEventWithGroups",
        "setSessionId",
        "resetSessionId"
    ];

    function v(e) {
        function t(t) {
            e[t] = function () {
                e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
            };
        }

        for (let n = 0; n < d.length; n++) {
            t(d[n]);
        }
    }

    v(n);
    n.getInstance = function (e) {
        e = (!e || e.length === 0 ? "$default_instance" : e).toLowerCase();
        if (!Object.prototype.hasOwnProperty.call(n._iq, e)) {
            n._iq[e] = {_q: []};
            v(n._iq[e]);
        }
        return n._iq[e];
    };
    e.amplitude = n;
})(window, document);

function filterPhoneNumber(phone) {
    return phone.split(" ").join("").split("+").join("")
}

function validatePhoneLink(phone) {
    phone = phone.split(" ").join("")
    phone = phone.split("+").join("")
    if (!phone.startsWith('+')) {
        phone = '+' + phone;
    }
    return phone;
}

function getWhatsappLink(phone, text) {
    return "https://wa.me/" + validatePhoneLink(phone) + (text !== "" ? "/?text=" + text : "");
}

function renderWidget(widgetConfig) {
    let widgetElement = document.createElement("div");
    let whatsappLinks = []
    for (let i = 0; i < widgetConfig.contacts.length; i++) {
        whatsappLinks.push(getWhatsappLink(widgetConfig.contacts[i].phone, widgetConfig.text))
    }

    let htmlString = widgetConfig.type === "ww-extended" ? getExtendedHtmlString(whatsappLinks, widgetConfig) : getStandardHtmlString(whatsappLinks[0], widgetConfig.call);

    widgetElement.id = "whatsapp-widget";
    widgetElement.classList.add(String(widgetConfig.size));
    widgetElement.classList.add(String(widgetConfig.position));
    widgetElement.classList.add(String(widgetConfig.type));
    widgetElement.innerHTML = htmlString.trim();
    document.body.appendChild(widgetElement);

    return widgetElement;
}

function insertStyles() {
    let headId = document.getElementsByTagName("head")[0];
    let link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    // link.href = "https://d3kzab8jj16n2f.cloudfront.net/v3/widget-style.css";
    link.href = "https://cdn.jsdelivr.net/gh/drewge23/sandbox@main/styles.css";
    headId.appendChild(link);
}

function tmWidgetInit(widgetConfig) {
    let widgetElement = renderWidget(widgetConfig);

    initAmplitude(widgetConfig);
    insertStyles();
    
    if (widgetConfig.type === "ww-extended") {

        widgetElement.querySelector('.ww-icon').onmouseover = function () {
            widgetElement.classList.add('widget-hovered')
        }
        widgetElement.querySelector('.ww-chat').onmouseover = function () {
            widgetElement.classList.add('widget-chat-hovered')
        }
        widgetElement.querySelector('.ww-chat').onmouseleave = function () {
            widgetElement.classList.remove('widget-chat-hovered')
        }
        widgetElement.onmouseleave = function () {
            setTimeout(() => {
                if (!widgetElement.classList.contains('widget-chat-hovered')) {
                    widgetElement.classList.remove('widget-hovered')
                }
            }, 300);
        }
        widgetElement.querySelector('.ww-icon').onclick = function () {
            widgetElement.classList.add('widget-clicked')
        }
        widgetElement.querySelector('.ww-close').onclick = function () {
            widgetElement.classList.remove('widget-clicked')
            widgetElement.classList.remove('widget-hovered')
        }
    }
}

function readCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(cookie_name, cookie_value, days) {
    let __d = new Date();
    __d.setTime(__d.getTime() + days * 24 * 60 * 60 * 1000);
    let __expires = "expires=" + __d.toUTCString();
    document.cookie = cookie_name + "=" + cookie_value + ";" + __expires + "; path=/; domain=." + window.location.hostname;
}

function initAmplitude(widgetConfig) {
    let opt_config = {
        includeReferrer: true,
        includeUtm: true,
        includeGclid: true,
        saveParamsReferrerOncePerSession: true,
        logAttributionCapturedEvent: true
    };
    let opt_callback = function (instance) {
        if (readCookie("widget_attributed") === null && user_id_for_amplitude != null) {
            instance.logEvent("widget_attributed");
            setCookie("widget_attributed", "1", 365);
        }
    };
    let userProperties = {
        widgetType: widgetConfig.type,
        widgetSource: "cdn",
        widgetDomain: window.location.hostname,
        clientEmail: widgetConfig.email,
        phone: filterPhoneNumber(widgetConfig.contacts[0].phone),
        email: widgetConfig.email,
    };
    let user_id_for_amplitude = filterPhoneNumber(widgetConfig.contacts[0].phone);
    console.log("Amplitude Attribution: about to init the client instance");
    amplitude.getInstance().init("0e73dc7c6a30ebbc4bf3ea1144ebdb71", user_id_for_amplitude, opt_config, opt_callback);
    amplitude.getInstance().setUserProperties(userProperties);
}

function getStandardHtmlString(whatsappLink, call) {
    htmlString = `<a target="_blank" href="${whatsappLink}" class="ww-text">${call}<div class="ww-arrow"></div></a><div class="ww-icon"><div><a class="ww-icon-link" target="_blank" href="${whatsappLink}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" fill-rule="evenodd"></path></svg></a></div><div><a rel="nofollow" class="ww-link" type="link" href="https://timelines.ai">TimelinesAI</a></div></div>`;
    return htmlString;
}

function getExtendedHtmlString(whatsappLinks, config) {
    htmlString = `<div class="ww-icon">
    <div>
      <div class="ww-icon-link" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" fill-rule="evenodd"></path></svg>
      </div>
    </div>
    <div>
      <a target="_blank" rel="nofollow" class="ww-link" type="link" href="https://timelines.ai">TimelinesAI</a>
    </div>
  </div>
  <div id="ww-chat" class="ww-chat">
    <div class="ww-chat__wrapper" >
      <div class="ww-chat__header">
        <div class="ww-close">
          <img src="https://cdn.shopify.com/s/files/1/0070/3666/5911/files/Vector.png?574" alt="">
        </div>
        <div class="ww-chat__header-text">
          <div class="ww-chat__brand-title">${config.brand}</div>
          <div class="ww-chat__brand-subtitle">${config.subtitle}</div>
        </div>
      </div>
      <div class="ww-chat__body">
      ${config.contacts.map((contact, index) => (
        `<div> <a href=${whatsappLinks[index]}> ${contact.name}, ${contact.title}, ${contact.phone}  </a> </div>`
    )).join('')}
        <div class="ww-chat__message">
          <div class="ww-chat__message-title">${config.brand}</div>
          <div class="ww-chat__message-body">${config.welcome}</div>
        </div>
      </div>
      <div class="ww-chat__button-container">
        <a target="_blank" class="ww-chat__button" role="button" href="${whatsappLinks[0]}" title="WhatsApp" rel="noreferrer noopener">
          <svg width="20" height="20" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M90,43.841c0,24.213-19.779,43.841-44.182,43.841c-7.747,0-15.025-1.98-21.357-5.455L0,90l7.975-23.522   c-4.023-6.606-6.34-14.354-6.34-22.637C1.635,19.628,21.416,0,45.818,0C70.223,0,90,19.628,90,43.841z M45.818,6.982   c-20.484,0-37.146,16.535-37.146,36.859c0,8.065,2.629,15.534,7.076,21.61L11.107,79.14l14.275-4.537   c5.865,3.851,12.891,6.097,20.437,6.097c20.481,0,37.146-16.533,37.146-36.857S66.301,6.982,45.818,6.982z M68.129,53.938   c-0.273-0.447-0.994-0.717-2.076-1.254c-1.084-0.537-6.41-3.138-7.4-3.495c-0.993-0.358-1.717-0.538-2.438,0.537   c-0.721,1.076-2.797,3.495-3.43,4.212c-0.632,0.719-1.263,0.809-2.347,0.271c-1.082-0.537-4.571-1.673-8.708-5.333   c-3.219-2.848-5.393-6.364-6.025-7.441c-0.631-1.075-0.066-1.656,0.475-2.191c0.488-0.482,1.084-1.255,1.625-1.882   c0.543-0.628,0.723-1.075,1.082-1.793c0.363-0.717,0.182-1.344-0.09-1.883c-0.27-0.537-2.438-5.825-3.34-7.977   c-0.902-2.15-1.803-1.792-2.436-1.792c-0.631,0-1.354-0.09-2.076-0.09c-0.722,0-1.896,0.269-2.889,1.344   c-0.992,1.076-3.789,3.676-3.789,8.963c0,5.288,3.879,10.397,4.422,11.113c0.541,0.716,7.49,11.92,18.5,16.223   C58.2,65.771,58.2,64.336,60.186,64.156c1.984-0.179,6.406-2.599,7.312-5.107C68.398,56.537,68.398,54.386,68.129,53.938z"></path>
          </svg>
          <span class="ww-chat__button-text">Start Chat</span>
        </a>
      </div>
      <div class="ww-chat__back-link">
        <a rel="nofollow" class="ww-link" type="link" href="https://timelines.ai">TimelinesAI  - Whatsapp Shared Inbox & CRM integration</a>
      </div>
    </div>
  </div>
  </div>`;
    return htmlString;
}
