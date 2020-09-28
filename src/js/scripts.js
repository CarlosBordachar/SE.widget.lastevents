let eventsLimit = 5,
    userLocale = "en-US",
    includeFollowers = true,
    includeRedemptions = true,
    includeHosts = true,
    minHost = 0,
    includeRaids = true,
    minRaid = 0,
    includeSubs = true,
    includeTips = true,
    minTip = 0,
    includeCheers = true,
    direction = "top",
    textOrder = "nameFirst",
    minCheer = 0;

let userCurrency,
    totalEvents = 0;

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) {
      return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        obj.detail.listener = "redemption-latest"
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;

    if (listener === 'follower') {
        if (includeFollowers) {
            addEvent('follower', 'Follower', event.name);
        }
    } else if (listener === 'redemption') {
        if (includeRedemptions) {
            addEvent('redemption', 'Redeemed', event.name);
        }
    } else if (listener === 'subscriber') {
        if (includeSubs) {
            if (event.amount === 'gift') {
                addEvent('sub', `Sub gift`, event.name);
            } else {
                addEvent('sub', `Sub X${event.amount}`, event.name);
            }
        }
    } else if (listener === 'host') {
        if (includeHosts && minHost <= event.amount) {
            addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
        }
    } else if (listener === 'cheer') {
        if (includeCheers && minCheer <= event.amount) {
            addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
        }
    } else if (listener === 'tip') {
        if (includeTips && minTip <= event.amount) {
            if (event.amount === parseInt(event.amount)) {
                addEvent('tip', event.amount.toLocaleString(userLocale, {
                    style: 'currency',
                    minimumFractionDigits: 0,
                    currency: userCurrency.code
                }), event.name);
            } else {
                addEvent('tip', event.amount.toLocaleString(userLocale, {
                    style: 'currency',
                    currency: userCurrency.code
                }), event.name);
            }
        }
    } else if (listener === 'raid') {
        if (includeRaids && minRaid <= event.amount) {
            addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
        }
    }
});

window.addEventListener('onWidgetLoad', function (obj) {
    let recents = obj.detail.recents;
    recents.sort(function (a, b) {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
    userCurrency = obj.detail.currency;
    const fieldData = obj.detail.fieldData;
    eventsLimit = fieldData.eventsLimit;
    includeFollowers = (fieldData.includeFollowers === "yes");
    includeRedemptions = (fieldData.includeRedemptions === "yes");
    includeHosts = (fieldData.includeHosts === "yes");
    minHost = fieldData.minHost;
    includeRaids = (fieldData.includeRaids === "yes");
    minRaid = fieldData.minRaid;
    includeSubs = (fieldData.includeSubs === "yes");
    includeTips = (fieldData.includeTips === "yes");
    minTip = fieldData.minTip;
    includeCheers = (fieldData.includeCheers === "yes");
    minCheer = fieldData.minCheer;
    direction = fieldData.direction;
    userLocale = fieldData.locale;
    textOrder = fieldData.textOrder;
    fadeoutTime = fieldData.fadeoutTime;

    let eventIndex;
    for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
        const event = recents[eventIndex];

        if (event.type === 'follower') {
            if (includeFollowers) {
                addEvent('follower', 'Follower', event.name);
            }
        } else if (event.type === 'redemption') {
            if (includeRedemptions) {
                addEvent('redemption', 'Redeemed', event.name);
            }
        } else if (event.type === 'subscriber') {
            if (!includeSubs) continue;
            if (event.amount === 'gift') {
                addEvent('sub', `Sub gift`, event.name);
            } else {
                addEvent('sub', `Sub X${event.amount}`, event.name);
            }

        } else if (event.type === 'host') {
            if (includeHosts && minHost <= event.amount) {
                addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
            }
        } else if (event.type === 'cheer') {
            if (includeCheers && minCheer <= event.amount) {
                addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
            }
        } else if (event.type === 'tip') {
            if (includeTips && minTip <= event.amount) {
                if (event.amount === parseInt(event.amount)) {
                    addEvent('tip', event.amount.toLocaleString(userLocale, {
                        style: 'currency',
                        minimumFractionDigits: 0,
                        currency: userCurrency.code
                    }), event.name);
                } else {
                    addEvent('tip', event.amount.toLocaleString(userLocale, {
                        style: 'currency',
                        currency: userCurrency.code
                    }), event.name);
                }
            }
        } else if (event.type === 'raid') {
            if (includeRaids && minRaid <= event.amount) {
                addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
            }
        }
    }
});


function addEvent(type, text, username) {
    totalEvents += 1;
    let element;
    if (textOrder === "actionFirst") {
        element = `
    <div class="event-container" id="event-${totalEvents}">
		<div class="backgroundsvg"></div>
        <div class="event-image event-${type}"></div>
        <div class="username-container">${text}</div>
       <div class="details-container">${username}</div>
    </div>`;
    } else {
        element = `
    <div class="event-container" id="event-${totalEvents}">
		<div class="backgroundsvg"></div>
        <div class="event-image event-${type}"></div>
        <div class="username-container">${username}</div>
       <div class="details-container">${text}</div>
    </div>`;
    }
    if (direction === "bottom") {
        $('.main-container').removeClass("fadeOutClass").show().append(element);
    } else {
        $('.main-container').removeClass("fadeOutClass").show().prepend(element);
    }
    if (fadeoutTime !== 999) {
        $('.main-container').addClass("fadeOutClass");
    }
    if (totalEvents > eventsLimit) {
        removeEvent(totalEvents - eventsLimit);
    }
    // Add class index for each event
    let initialEventId = totalEvents > eventsLimit ? totalEvents - eventsLimit + 1 : 1;
    addEventIndexClass(initialEventId, totalEvents);
}

function addEventIndexClass(from, to) {
    for(var i = from; i <= to; i++)
    {
        let classNumber = to-i;
        $(`#event-${i}`).addClass(`eventIndex${classNumber}`);
    }
}

function removeEvent(eventId) {
    $(`#event-${eventId}`).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(`#event-${eventId}`).remove();
    });
};


function fnOnLoad() {
    var obj = 
    {
        detail: {
            currency: "USD"
            , recents: [{
                    createAt:"2020-09-25"
                    , type: "follower"
                    , name: "MilthoLogic"
                }
                ,{
                    createAt:"2020-09-24"
                    , type: "redemption"
                    , name: "Me£987_hazt"
                }
                ,{
                    createAt:"2020-09-25"
                    , type: "subscriber"
                    , name: "Melit498Lilitu"
                    , amount: "gift"
                }
                ,{
                    createAt:"2020-09-22"
                    , type: "subscriber"
                    , name: "PipoLaroqueGGMath"
                    , amount: "50"
                }
                ,{
                    createAt:"2020-09-21"
                    , type: "host"
                    , name: "tilu_9983_~♥"
                    , amount: "20"
                }
                ,{
                    createAt:"2020-09-19"
                    , type: "cheer"
                    , name: "DevoraMelaEntera"
                    , amount: "9"
                }
                ,{
                    createAt:"2020-09-26"
                    , type: "tip"
                    , name: "EstebanQuitoEschico"
                    , amount: "6"
                }
                ,{
                    createAt:"2020-09-18"
                    , type: "raid"
                    , name: "UnaCrazyGirl"
                    , amount: "9"
                }]
            , fieldData: {
                eventsLimit: 5
                , includeFollowers: "yes"
                , includeRedemptions: "yes"
                , includeHosts: "yes"
                , minHost: 1
                , includeRaids: "yes"
                , minRaid: 1
                , includeSubs: "yes"
                , includeTips: "yes"
                , minTip: 1
                , includeCheers: "yes"
                , minCheer: 1
                , direction: "bottom"
                , locale: "en-US"
                , textOrder: "nameFirst"
                , fadeoutTime: 2

            }
        }
    };

    let recents = obj.detail.recents;
    recents.sort(function (a, b) {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });

    userCurrency = obj.detail.currency;
    const fieldData = obj.detail.fieldData;
    eventsLimit = fieldData.eventsLimit;
    includeFollowers = (fieldData.includeFollowers === "yes");
    includeRedemptions = (fieldData.includeRedemptions === "yes");
    includeHosts = (fieldData.includeHosts === "yes");
    minHost = fieldData.minHost;
    includeRaids = (fieldData.includeRaids === "yes");
    minRaid = fieldData.minRaid;
    includeSubs = (fieldData.includeSubs === "yes");
    includeTips = (fieldData.includeTips === "yes");
    minTip = fieldData.minTip;
    includeCheers = (fieldData.includeCheers === "yes");
    minCheer = fieldData.minCheer;
    direction = fieldData.direction;
    userLocale = fieldData.locale;
    textOrder = fieldData.textOrder;
    fadeoutTime = fieldData.fadeoutTime;

    let eventIndex;
    for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
        const event = recents[eventIndex];

        if (event.type === 'follower') {
            if (includeFollowers) {
                addEvent('follower', 'Follower', event.name);
            }
        } else if (event.type === 'redemption') {
            if (includeRedemptions) {
                addEvent('redemption', 'Redeemed', event.name);
            }
        } else if (event.type === 'subscriber') {
            if (!includeSubs) continue;
            if (event.amount === 'gift') {
                addEvent('sub', `Sub gift`, event.name);
            } else {
                addEvent('sub', `Sub X${event.amount}`, event.name);
            }

        } else if (event.type === 'host') {
            if (includeHosts && minHost <= event.amount) {
                addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
            }
        } else if (event.type === 'cheer') {
            if (includeCheers && minCheer <= event.amount) {
                addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
            }
        } else if (event.type === 'tip') {
            if (includeTips && minTip <= event.amount) {
                if (event.amount === parseInt(event.amount)) {
                    addEvent('tip', event.amount.toLocaleString(userLocale, {
                        style: 'currency',
                        minimumFractionDigits: 0,
                        currency: userCurrency.code
                    }), event.name);
                } else {
                    addEvent('tip', event.amount.toLocaleString(userLocale, {
                        style: 'currency',
                        currency: userCurrency.code
                    }), event.name);
                }
            }
        } else if (event.type === 'raid') {
            if (includeRaids && minRaid <= event.amount) {
                addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
            }
        }
    }

};


function fnAddRandomEvent() {
    var eventList = [
    {
        detail: {
            currency: "usd"
            , listener: "follower"
            , event: {
                /*itemId: 1
                ,*/ name: "Carlos"
                , amount: null
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "subscriber"
            , event: {
                /*itemId: 1
                ,*/ name: "LuminareNiceGG"
                , amount: 85
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "subscriber"
            , event: {
                /*itemId: 1
                ,*/ name: "Mateo"
                , amount: "gift"
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "subscriber"
            , event: {
                /*itemId: 1
                ,*/ name: "Carlos"
                , amount: 156
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "subscriber"
            , event: {
                /*itemId: 1
                ,*/ name: "Rodolfo"
                , amount: 2
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "follower"
            , event: {
                /*itemId: 1
                ,*/ name: "DarkDemon"
                , amount: null
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "cheer"
            , event: {
                /*itemId: 1
                ,*/ name: "Milagros"
                , amount: 500
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "host"
            , event: {
                /*itemId: 1
                ,*/ name: "Manuel"
                , amount: 156
            }
        }
    }
    ,{
        detail: {
            currency: "usd"
            , listener: "tip"
            , event: {
                /*itemId: 1
                ,*/ name: "Alejandra"
                , amount: 90
            }
        }
    }];


    var randomIndex = Math.floor(Math.random() * eventList.length)
    var obj = eventList[randomIndex];
    /*var obj = 
    {
        detail: {
            currency: "usd"
            , listener: "follower"
            , event: {
                itemId: 1
                , name: "Carlos"
                , amount: null
            }
        }
    };*/

    if (!obj.detail.event) {
      return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        obj.detail.listener = "redemption-latest"
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;

    if (listener === 'follower') {
        if (includeFollowers) {
            addEvent('follower', 'Follower', event.name);
        }
    } else if (listener === 'redemption') {
        if (includeRedemptions) {
            addEvent('redemption', 'Redeemed', event.name);
        }
    } else if (listener === 'subscriber') {
        if (includeSubs) {
            if (event.amount === 'gift') {
                addEvent('sub', `Sub gift`, event.name);
            } else {
                addEvent('sub', `Sub X${event.amount}`, event.name);
            }
        }
    } else if (listener === 'host') {
        if (includeHosts && minHost <= event.amount) {
            addEvent('host', `Host ${event.amount.toLocaleString()}`, event.name);
        }
    } else if (listener === 'cheer') {
        if (includeCheers && minCheer <= event.amount) {
            addEvent('cheer', `${event.amount.toLocaleString()} Bits`, event.name);
        }
    } else if (listener === 'tip') {
        if (includeTips && minTip <= event.amount) {
            if (event.amount === parseInt(event.amount)) {
                addEvent('tip', event.amount.toLocaleString(userLocale, {
                    style: 'currency',
                    minimumFractionDigits: 0,
                    currency: userCurrency.code
                }), event.name);
            } else {
                addEvent('tip', event.amount.toLocaleString(userLocale, {
                    style: 'currency',
                    currency: userCurrency.code
                }), event.name);
            }
        }
    } else if (listener === 'raid') {
        if (includeRaids && minRaid <= event.amount) {
            addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
        }
    }
};