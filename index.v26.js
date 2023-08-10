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
    return phone.split(" ").join("").split("+").join("").split("-").join("")
}

function validatePhoneLink(phone) {
    phone = filterPhoneNumber(phone)
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

    widgetElement.id = "whatsapp-widget-container";
    // widgetElement.classList.add(String(widgetConfig.size));
    // widgetElement.classList.add(String(widgetConfig.position));
    // widgetElement.classList.add(String(widgetConfig.type));
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
    link.href = "https://cdn.jsdelivr.net/gh/drewge23/sandbox@main/styles.v10.css";
    // link.href = "https://raw.githubusercontent.com/drewge23/sandbox/main/styles.css";
    headId.appendChild(link);
}

function tmWidgetInit(widgetConfig) {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    const gaClientId = getCookie('_ga').split('.')[2] + '.' + getCookie('_ga').split('.')[3];
    const gaSessionId = getCookie('_ga').split('.')[3];
    const unixTimestampMillis = new Date().getTime();

    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');

    console.log('Gclid:', gclid);
    console.log('GA Client ID:', gaClientId);
    console.log('GA Session ID:', gaSessionId);
    console.log('Unix Timestamp (ms):', unixTimestampMillis);
    
    let widgetElement = renderWidget(widgetConfig);

    initAmplitude(widgetConfig);
    insertStyles();
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
    let htmlString = `<div id='whatsapp-widget' class='ww-standard'>
                <div class='ww-standard-text'>
                    <a href="${whatsappLink}" target='_blank'>
                        ${call}
                    </a>
                </div>
                <a href="${whatsappLink}" target='_blank'>
                    <div class='ww-standard-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" view-box="0 0 48 48" fill="none">
                            <path
                                d="M23.8151 0C11.042 0 0.687174 10.4746 0.687174 23.3965C0.687174 29.8091 4.04401 35.5411 4.04401 35.5411L0 48L12.6732 43.9037C12.6732 43.9037 17.378 46.793 23.8162 46.793C36.5904 46.793 46.9452 36.3184 46.9452 23.3965C46.9441 10.4746 36.5893 0 23.8151 0ZM23.8151 43.0486C17.8687 43.0486 13.1079 39.7973 13.1079 39.7973L5.80256 42.2081L8.17254 35.0536C8.17254 35.0536 4.3865 29.7514 4.3865 23.3954C4.3865 12.5411 13.0848 3.74322 23.814 3.74322C34.5442 3.74322 43.2426 12.5422 43.2426 23.3954C43.2437 34.2497 34.5453 43.0486 23.8151 43.0486Z"
                                fill="white"/>
                            <path
                                d="M15.0085 13.2107C15.0085 13.2107 15.6331 12.8098 15.9591 12.8098C16.2852 12.8098 17.7814 12.8098 17.7814 12.8098C17.7814 12.8098 18.2699 12.8964 18.4949 13.4105C18.7188 13.9258 20.2556 17.5768 20.3698 17.8589C20.484 18.1409 20.7825 18.8372 20.3039 19.4612C19.8253 20.0853 18.8253 21.2512 18.8253 21.2512C18.8253 21.2512 18.429 21.6121 18.7726 22.1862C19.1162 22.7603 20.3237 24.6546 21.9022 26.086C23.4807 27.5173 25.4149 28.57 26.3787 28.8909C27.3425 29.2118 27.5544 28.7843 27.9232 28.3035C28.2931 27.8227 29.4414 26.3536 29.4414 26.3536C29.4414 26.3536 29.8376 25.7662 30.617 26.127C31.3964 26.4879 35.1857 28.3445 35.1857 28.3445C35.1857 28.3445 35.6479 28.4245 35.6742 28.9453C35.7006 29.4661 36.0178 31.0251 34.6446 32.5242C33.2713 34.0243 30.3503 34.7183 28.9671 34.3264C27.584 33.9355 23.012 32.7251 20.0295 29.9125C17.047 27.0998 14.632 24.1383 13.6441 21.9541C12.6561 19.7699 12.711 18.4752 12.7659 17.8644C12.8208 17.2537 13.1369 14.4233 15.0085 13.2107Z"
                                fill="white"/>
                        </svg>
                    </div>
                </a>
    </div>`;
    return htmlString;
}

function toggleWidget() {
    document.getElementById('whatsapp-widget-extended').classList.toggle("ww-open");
    document.getElementById('ww-extended-icon').classList.toggle("ww-icon-open");
}

function getExtendedHtmlString(whatsappLinks, config) {
    let htmlString = `<div id='whatsapp-widget-extended' class='ww-extended'>
                <div class='ww-extended-header'>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" view-box="0 0 48 48" fill="none">
                            <path
                                d="M23.8151 0C11.042 0 0.687174 10.4746 0.687174 23.3965C0.687174 29.8091 4.04401 35.5411 4.04401 35.5411L0 48L12.6732 43.9037C12.6732 43.9037 17.378 46.793 23.8162 46.793C36.5904 46.793 46.9452 36.3184 46.9452 23.3965C46.9441 10.4746 36.5893 0 23.8151 0ZM23.8151 43.0486C17.8687 43.0486 13.1079 39.7973 13.1079 39.7973L5.80256 42.2081L8.17254 35.0536C8.17254 35.0536 4.3865 29.7514 4.3865 23.3954C4.3865 12.5411 13.0848 3.74322 23.814 3.74322C34.5442 3.74322 43.2426 12.5422 43.2426 23.3954C43.2437 34.2497 34.5453 43.0486 23.8151 43.0486Z"
                                fill="white"/>
                            <path
                                d="M15.0085 13.2107C15.0085 13.2107 15.6331 12.8098 15.9591 12.8098C16.2852 12.8098 17.7814 12.8098 17.7814 12.8098C17.7814 12.8098 18.2699 12.8964 18.4949 13.4105C18.7188 13.9258 20.2556 17.5768 20.3698 17.8589C20.484 18.1409 20.7825 18.8372 20.3039 19.4612C19.8253 20.0853 18.8253 21.2512 18.8253 21.2512C18.8253 21.2512 18.429 21.6121 18.7726 22.1862C19.1162 22.7603 20.3237 24.6546 21.9022 26.086C23.4807 27.5173 25.4149 28.57 26.3787 28.8909C27.3425 29.2118 27.5544 28.7843 27.9232 28.3035C28.2931 27.8227 29.4414 26.3536 29.4414 26.3536C29.4414 26.3536 29.8376 25.7662 30.617 26.127C31.3964 26.4879 35.1857 28.3445 35.1857 28.3445C35.1857 28.3445 35.6479 28.4245 35.6742 28.9453C35.7006 29.4661 36.0178 31.0251 34.6446 32.5242C33.2713 34.0243 30.3503 34.7183 28.9671 34.3264C27.584 33.9355 23.012 32.7251 20.0295 29.9125C17.047 27.0998 14.632 24.1383 13.6441 21.9541C12.6561 19.7699 12.711 18.4752 12.7659 17.8644C12.8208 17.2537 13.1369 14.4233 15.0085 13.2107Z"
                                fill="white"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="ww-title">Start a conversation</h3>
                        <p>Hi! Click on of our members below to chat on WhatsApp ;)</p>
                    </div>
                </div>

                <div class='ww-extended-body'>
                    <p>The team typically replies in a few minutes</p>
                    ${config.contacts.map((contact, index) => (
                        `<a target='_blank' href="${whatsappLinks[index]}">
                        <div class='ww-extended-contact'>
                            <div>
                                <p class='ww-extended-contact-name'>
                                    ${contact.name ? contact.name : contact.title}
                                </p>
                                ${contact.name && `<p class='ww-extended-contact-title'>
                                    ${contact.title}
                                </p>`}
                            </div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" view-box="0 0 29 29"
                                     fill="none">
                                    <path
                                        d="M14.8807 0C7.30085 0 1.15608 6.21584 1.15608 13.884C1.15608 17.6894 3.14809 21.0909 3.14809 21.0909L0.748291 28.4843L8.26885 26.0534C8.26885 26.0534 11.0608 27.768 14.8813 27.768C22.4618 27.768 28.6066 21.5521 28.6066 13.884C28.6059 6.21584 22.4612 0 14.8807 0ZM14.8807 25.546C11.352 25.546 8.5268 23.6166 8.5268 23.6166L4.19166 25.0472L5.59805 20.8016C5.59805 20.8016 3.35133 17.6551 3.35133 13.8833C3.35133 7.44213 8.51312 2.22131 14.88 2.22131C21.2476 2.22131 26.4094 7.44279 26.4094 13.8833C26.41 20.3245 21.2482 25.546 14.8807 25.546Z"
                                        fill="#44C654"/>
                                    <path
                                        d="M9.65491 7.83895C9.65491 7.83895 10.0256 7.60107 10.219 7.60107C10.4125 7.60107 11.3004 7.60107 11.3004 7.60107C11.3004 7.60107 11.5903 7.65247 11.7238 7.95756C11.8567 8.26331 12.7687 10.4299 12.8364 10.5973C12.9042 10.7647 13.0813 11.1778 12.7973 11.5482C12.5133 11.9185 11.9199 12.6104 11.9199 12.6104C11.9199 12.6104 11.6847 12.8245 11.8886 13.1652C12.0925 13.5059 12.8091 14.63 13.7458 15.4794C14.6825 16.3288 15.8303 16.9535 16.4022 17.1439C16.9742 17.3344 17.0999 17.0807 17.3188 16.7953C17.5383 16.51 18.2197 15.6382 18.2197 15.6382C18.2197 15.6382 18.4548 15.2897 18.9173 15.5038C19.3798 15.718 21.6285 16.8197 21.6285 16.8197C21.6285 16.8197 21.9028 16.8672 21.9184 17.1762C21.934 17.4853 22.1223 18.4104 21.3074 19.3C20.4925 20.1902 18.759 20.6021 17.9383 20.3695C17.1175 20.1375 14.4044 19.4193 12.6345 17.7502C10.8646 16.081 9.43148 14.3236 8.84521 13.0275C8.25894 11.7313 8.29151 10.963 8.32408 10.6006C8.35665 10.2382 8.54426 8.55852 9.65491 7.83895Z"
                                        fill="#44C654"/>
                                </svg>
                            </div>
                        </div></a>`
                    )).join('')}
                    <div class='ww-extended-logo'>
                        <a target='_blank' href="https://timelines.ai/">
                        <svg xmlns="http://www.w3.org/2000/svg" width="94" height="16" view-box="0 0 94 16" fill="none">
                            <path
                                d="M8.34653 11.9814C8.06964 14.0044 7.08862 15.9805 4.49368 15.9805C2.53561 15.9805 1.08782 14.8418 1.1076 12.4235L1.15111 5.87319H0V5.64232C2.19146 5.18059 3.93988 3.81104 4.70333 1.68237H4.91694V5.34494H8.10919L8.00239 5.87319H4.91694V12.5057C4.91694 13.5818 5.34416 14.1922 6.19463 14.1922C7.17565 14.1922 7.81252 13.3509 8.08941 11.8953L8.34653 11.9814Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M13.7738 13.4762C13.7738 14.8654 13.8371 15.1393 14.7746 15.7301V15.7732H8.96369V15.7301C9.90119 15.1393 9.96448 14.8654 9.96448 13.4762V7.68501C9.96448 6.25286 9.8379 5.95938 8.8371 5.38809V5.34504H13.7778V13.4762H13.7738ZM11.8157 0.0625C13.0499 0.0625 13.9874 0.927272 13.9874 2.06204C13.9874 3.19681 13.0499 4.08506 11.8157 4.08506C10.6013 4.08506 9.68758 3.20072 9.68758 2.06204C9.68758 0.923359 10.6013 0.0625 11.8157 0.0625Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M30.6132 5.1377C32.9115 5.1377 33.9123 6.73811 33.9123 8.78069V13.4763C33.9123 14.8654 33.9756 15.1393 34.9131 15.7302V15.7732H29.1021V15.7302C30.0396 15.1393 30.1029 14.8654 30.1029 13.4763V8.67504C30.1029 7.70462 29.7825 6.92593 28.7817 6.92593C27.8007 6.92593 27.1203 7.81027 27.1203 9.70416V13.4724C27.1203 14.8615 27.2034 15.1354 28.1211 15.7263V15.7693H22.33V15.7302C23.2437 15.1393 23.311 14.8654 23.311 13.4763V8.67504C23.311 7.70462 23.0143 6.92593 22.0135 6.92593C21.0127 6.92593 20.3521 7.81027 20.3521 9.70416V13.4724C20.3521 14.8615 20.4154 15.1354 21.3529 15.7263V15.7693H15.542V15.7302C16.4795 15.1393 16.5428 14.8654 16.5428 13.4763V7.68505C16.5428 6.2529 16.4162 5.95942 15.4154 5.38813V5.34508H20.3561V8.08418C20.8466 6.19029 22.0373 5.1377 23.849 5.1377C25.8506 5.1377 26.9146 6.37811 27.1045 8.08418C27.5911 6.19029 28.8015 5.1377 30.6132 5.1377Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M45.7913 10.0876H39.0191C39.0191 12.6976 40.4036 14.2589 42.4487 14.2589C43.7462 14.2589 44.8735 13.6915 45.5341 12.3846L45.6845 12.4472C45.0674 14.7011 43.1528 15.9845 40.724 15.9845C37.6781 15.9845 35.1662 14.0045 35.1662 10.5728C35.1662 7.26636 37.6979 5.14161 40.7438 5.14161C44.1734 5.13769 45.7913 7.30549 45.7913 10.0876ZM42.1283 9.64546C42.1283 7.28593 41.9582 5.49769 40.7438 5.49769C39.6362 5.49769 39.0824 7.16071 39.0389 9.64546H42.1283Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M51.345 13.4764C51.345 14.8655 51.4083 15.1394 52.3458 15.7302V15.7733H46.5547V15.7302C47.4685 15.1394 47.5357 14.8655 47.5357 13.4764V2.33606C47.5357 0.923467 47.2786 0.524341 46.2778 0.0391299V0H51.345V13.4764Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M57.9233 13.4762C57.9233 14.8654 57.9866 15.1393 58.9241 15.7301V15.7732H53.1132V15.7301C54.0507 15.1393 54.114 14.8654 54.114 13.4762V7.68501C54.114 6.25286 53.9874 5.95938 52.9866 5.38809V5.34504H57.9273V13.4762H57.9233ZM55.9653 0.0625C57.1994 0.0625 58.1369 0.927272 58.1369 2.06204C58.1369 3.19681 57.1994 4.08506 55.9653 4.08506C54.7509 4.08506 53.8371 3.20072 53.8371 2.06204C53.8371 0.923359 54.7509 0.0625 55.9653 0.0625Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M64.5017 5.34899V8.08809C65.012 6.1942 66.3965 5.1416 68.1845 5.1416C70.5065 5.1416 71.5706 6.74202 71.5706 8.7846V13.4802C71.5706 14.8693 71.6339 15.1432 72.5714 15.7341V15.7771H66.7605V15.7302C67.698 15.1393 67.7612 14.8654 67.7612 13.4763V8.67504C67.7612 7.70461 67.3142 6.92593 66.3135 6.92593C65.2494 6.92593 64.5057 7.81026 64.5057 9.70415V13.4724C64.5057 14.8615 64.569 15.1354 65.5065 15.7263V15.7693H59.6916V15.7302C60.6291 15.1393 60.6924 14.8654 60.6924 13.4763V7.68505C60.6924 6.25289 60.5658 5.95942 59.565 5.38812V5.34508H64.5017V5.34899Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M83.8727 10.0876H77.1045C77.1045 12.6976 78.489 14.2589 80.5341 14.2589C81.8316 14.2589 82.959 13.6915 83.6196 12.3846L83.7699 12.4472C83.1528 14.7011 81.2382 15.9845 78.8094 15.9845C75.7635 15.9845 73.2517 14.0045 73.2517 10.5728C73.2517 7.26636 75.7833 5.14161 78.8292 5.14161C82.2549 5.13769 83.8727 7.30549 83.8727 10.0876ZM80.2137 9.64546C80.2137 7.28593 80.0436 5.49769 78.8292 5.49769C77.7216 5.49769 77.1678 7.16071 77.1243 9.64546H80.2137Z"
                                fill="#C4C4C4"/>
                            <path
                                d="M87.2786 6.80076C87.2786 7.7477 87.9392 8.04118 89.8973 8.63204C92.6663 9.49681 93.8134 10.4438 93.8134 12.4863C93.8134 14.6346 92.0452 15.9806 89.4899 15.9806C88.0223 15.9806 87.0215 15.5385 86.2541 15.5385C85.7201 15.5385 85.4669 15.7693 85.1663 16.0002L84.9329 12.1459H84.9764C86.1908 14.3998 87.6148 15.6206 89.4899 15.6206C90.5342 15.6206 91.3016 15.1159 91.3016 14.1063C91.3016 13.0302 90.3641 12.7602 88.7699 12.275C86.1512 11.4768 85.0001 10.4203 85.0001 8.40117C85.0001 6.44468 86.6813 5.13774 88.853 5.13774C90.194 5.13774 91.0049 5.64251 91.7683 5.64251C92.2588 5.64251 92.5753 5.43121 92.959 5.11426V8.52639H92.9155C91.978 6.71467 90.3601 5.49382 88.849 5.49382C87.8957 5.49773 87.2786 6.02207 87.2786 6.80076Z"
                                fill="#C4C4C4"/>
                        </svg>
                        </a>
                    </div>
                </div>
            </div>
            <div id='ww-extended-icon' class='ww-extended-icon'
                 onclick="toggleWidget()"
                 >
                 <div width='48px' height='48px'>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="48" height="48" view-box="0 0 48 48">
                     <path d="M23.8151 0C11.042 0 0.687174 10.4746 0.687174 23.3965C0.687174 29.8091 4.04401 35.5411 4.04401 35.5411L0 48L12.6732 43.9037C12.6732 43.9037 17.378 46.793 23.8162 46.793C36.5904 46.793 46.9452 36.3184 46.9452 23.3965C46.9441 10.4746 36.5893 0 23.8151 0ZM23.8151 43.0486C17.8687 43.0486 13.1079 39.7973 13.1079 39.7973L5.80256 42.2081L8.17254 35.0536C8.17254 35.0536 4.3865 29.7514 4.3865 23.3954C4.3865 12.5411 13.0848 3.74322 23.814 3.74322C34.5442 3.74322 43.2426 12.5422 43.2426 23.3954C43.2437 34.2497 34.5453 43.0486 23.8151 43.0486Z" fill="white"/>
                     <path d="M15.0085 13.2107C15.0085 13.2107 15.6331 12.8098 15.9591 12.8098C16.2852 12.8098 17.7814 12.8098 17.7814 12.8098C17.7814 12.8098 18.2699 12.8964 18.4949 13.4105C18.7188 13.9258 20.2556 17.5768 20.3698 17.8589C20.484 18.1409 20.7825 18.8372 20.3039 19.4612C19.8253 20.0853 18.8253 21.2512 18.8253 21.2512C18.8253 21.2512 18.429 21.6121 18.7726 22.1862C19.1162 22.7603 20.3237 24.6546 21.9022 26.086C23.4807 27.5173 25.4149 28.57 26.3787 28.8909C27.3425 29.2118 27.5544 28.7843 27.9232 28.3035C28.2931 27.8227 29.4414 26.3536 29.4414 26.3536C29.4414 26.3536 29.8376 25.7662 30.617 26.127C31.3964 26.4879 35.1857 28.3445 35.1857 28.3445C35.1857 28.3445 35.6479 28.4245 35.6742 28.9453C35.7006 29.4661 36.0178 31.0251 34.6446 32.5242C33.2713 34.0243 30.3503 34.7183 28.9671 34.3264C27.584 33.9355 23.012 32.7251 20.0295 29.9125C17.047 27.0998 14.632 24.1383 13.6441 21.9541C12.6561 19.7699 12.711 18.4752 12.7659 17.8644C12.8208 17.2537 13.1369 14.4233 15.0085 13.2107Z" fill="white"/>
                 </svg>
                 </div>
            </div>`;
    return htmlString;
}
