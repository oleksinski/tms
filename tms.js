(function (testMode) {

    if (testMode) {
        console.log('Test mode ON');
    }

    var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var bankHolidays = [
        getDateWithHumanReadableParams(2017, 1, 2),
        getDateWithHumanReadableParams(2017, 1, 9),
        getDateWithHumanReadableParams(2017, 3, 8),
        getDateWithHumanReadableParams(2017, 4, 17),
        getDateWithHumanReadableParams(2017, 5, 1),
        getDateWithHumanReadableParams(2017, 5, 2),
        getDateWithHumanReadableParams(2017, 5, 9),
        getDateWithHumanReadableParams(2017, 6, 5),
        getDateWithHumanReadableParams(2017, 6, 28),
        getDateWithHumanReadableParams(2017, 8, 24),
        getDateWithHumanReadableParams(2017, 10, 16)
    ];

    var holidaysTimestamp = bankHolidays.map(function (d) {
        return d.getTime()
    });

    function getDateWithHumanReadableParams(y, m, d, h, min, s) {
        if (typeof m == 'undefined') m = 1;
        if (typeof d == 'undefined') d = 1;
        if (typeof h == 'undefined') h = 0;
        if (typeof min == 'undefined') min = 0;
        if (typeof s == 'undefined') s = 0;
        return new Date(y, m - 1, d, h, min, s);
    }

    function isBankHoliday(date) {
        return holidaysTimestamp.indexOf(date.getTime()) !== -1;
    }

    function isWorkingDay(date) {
        return weekday[date.getDay()] !== 'Saturday'
            && weekday[date.getDay()] !== 'Sunday'
            && !isBankHoliday(date);
    }

    function getDaysInMonth(date) {
        var d = getLastDateInMonth(date);
        return d.getDate();
    }

    function getFirstDateInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function getLastDateInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    function getEndOfWorkingDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18);
    }

    function getWorkingMinsLeft(date) {
        var end = getEndOfWorkingDay(date);

        var dateMs = date.getTime();
        //console.log('date time:', date, dateMs);
        var endMs = end.getTime();
        //console.log('end time:', end, endMs);
        var mins = Math.round((endMs - dateMs) / 1000 / 60);
        //console.log('Mins diff', mins);
        return mins > 0 ? mins : 0;
    }

    function getWorkingDaysInMonth(date) {
        return getWorkingDaysInMonthLeft(getFirstDateInMonth(date), true);
    }

    function getWorkingDaysInMonthLeft(date, includingDate) {
        includingDate = !!includingDate;
        var dateDayN = date.getDate();
        if (!includingDate) {
            dateDayN++;
        }
        var lastDayN = getDaysInMonth(date);
        var businessDays = 0;
        while (dateDayN < lastDayN) {
            var d = new Date(date.getFullYear(), date.getMonth(), dateDayN);
            if (isWorkingDay(d)) {
                businessDays++;
            }
            dateDayN++;
        }
        return businessDays;
    }

    function formatMinutes(mins) {
        var r = '';
        var h = Math.trunc(mins / 60);
        var m = mins - h * 60;

        if (h > 0) {
            r = h + 'h';
        }
        if (m > 0) {
            if (r !== '') {
                r += ' ';
            }
            r += Math.floor(m) + 'm';
        }

        return r;
    }

    function formatDate(date) {
        var pad = function (n) {return String('00' + n).slice(-2);}
        var d = pad(date.getDate());
        var m = pad(date.getMonth() + 1);
        var y = date.getFullYear();
        return (d + '.' + m + '.' + y);
    }

    function getMinutes(val) {

        if (val) {
            var arr = val.split(' ');

            var h = 0, m = 0;

            if (typeof arr[0] !== 'undefined') {
                h = arr[0].replace('h', '');
                h = h.replace('hour', '');
                h = h.replace('hours', '');
                h = parseInt(h, 10);
            }

            if (typeof arr[1] !== 'undefined') {
                m = arr[1].replace('min', '');
                m = m.replace('mins', '');
                m = m.replace('m', '');
                m = parseInt(m, 10);
            }

            return h * 60 + m;
        }
        else {
            return 0;
        }
    }

    /**
     * td[6] - Logged start time
     * td[7] - Logged end time
     * @param tdNumber
     * @returns {number}
     */
    function getTimeDiffMinutes(tdNumber) {
        var date = getData('now');
        var dateFormatted = formatDate(date);

        var tr = [].filter.call(document.querySelectorAll('td[role="gridcell"]'), function (el) {
            return el.innerHTML.trim() === dateFormatted;
        }).map(function(el){
            return el.parentElement;
        }).shift();

        if (tr) {
            var tds = tr.getElementsByTagName('td');
            if (tds && tds.length >= (tdNumber + 1)) {
                var time = tds[tdNumber].innerHTML.split(':');
                var hour = time[0], mins = time[1];
                return Math.round(Math.abs(date - new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, mins))/1000/60);
            }
        }

        return 0;
    }

    function getWorkedMinutesToday() {
        return getTimeDiffMinutes(6);
    }

    function getWorkedMinutesAfterLoggedEndTimeToday() {
        return getTimeDiffMinutes(7);
    }

    function getData(key) {

        var val = null;

        if (testMode) {
            var values = {
                'expectedMinutes': getMinutes('168h 0min (96h 0min)'),
                'workedLoggedMinutes': getMinutes('95h 13min'),
                'workedMinutesToday': 100,
                'workedMinutesAfterLoggedEndTimeToday': 75,
                'now': getDateWithHumanReadableParams(2017, 9, 27, 10, 44),
            };
            val = values[key];
        }
        else {
            var selector = function (s) {
                return $("input[ng-model='" + s + "']").val();
            }

            switch (key) {
                case 'expectedMinutes':
                    val = getMinutes(selector('attendance.BothExpected'));
                    break;
                case 'workedLoggedMinutes':

                    //val = getMinutes(selector('attendance.Actual'));

                    val = (function () {
                        var actualMins = 0;
                        var dataWorkedItems = document.querySelectorAll('.ng-binding[ng-bind="dataItem.Worked"');
                        dataWorkedItems.forEach(function (el) {
                            actualMins += getMinutes(el.innerText);
                        });
                        return actualMins;
                    }).call(this);
                    break;
                case 'workedMinutesToday':
                    val = getWorkedMinutesToday();
                    break;
                case 'workedMinutesAfterLoggedEndTimeToday':
                    val = getWorkedMinutesAfterLoggedEndTimeToday();
                    break;
                case 'now':
                    val = new Date();
                    break;
            }
        }

        //console.log(key + ' = ', val);

        return val;
    }

    return (function () {
        var date = getData('now');

        var expectedMinutes = getData('expectedMinutes');

        var workedLoggedMinutes = getData('workedLoggedMinutes');
        var workedMinutesAfterLoggedEndTimeToday = getData('workedMinutesAfterLoggedEndTimeToday');
        var workedMinutesTotal = workedLoggedMinutes + workedMinutesAfterLoggedEndTimeToday;

        var workedMinutesToday = getData('workedMinutesToday');
        if (workedMinutesToday > 60 && date.getHours() > 13) {
            workedMinutesToday -= 60; // distract an hour as lunch time
        }

        var leftTotalMinutes = expectedMinutes - workedMinutesTotal;

        var workingDaysInMonth = getWorkingDaysInMonth(date);
        var workingDaysLeftInMonth = getWorkingDaysInMonthLeft(date);

        var leftMPerDayMinutes = workingDaysLeftInMonth > 0 ? leftTotalMinutes / workingDaysLeftInMonth : 0;

        return {
            'Worked today': formatMinutes(workedMinutesToday),
            'Daily ratio 1.0 forecast': formatMinutes(leftMPerDayMinutes),
            'Total left': formatMinutes(leftTotalMinutes),
            'Working days left': '' + workingDaysLeftInMonth,
            'Working days total': '' + workingDaysInMonth
        };
    })();

})(false);