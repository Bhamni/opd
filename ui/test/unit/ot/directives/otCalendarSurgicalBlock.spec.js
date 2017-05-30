'use strict';

xdescribe("otCalendarSurgicalBlock", function () {
    var simpleHtml = '<ot-calendar-surgical-block surgical-block="surgicalBlock"' +
        ' grid-offset="gridOffset" calendar-start-datetime="calendarStartDatetime"' +
        ' calendar-end-datetime="calendarEndDatetime" day-view-split="dayViewSplit" ></ot-calendar-surgical-block>';
    var $compile, element, mockBackend, scope;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.ot'));
    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        mockBackend = $httpBackend;
    }));


    var surgicalBlock =
    {
        id: 60,
        provider: {uuid: "providerUuid1", display: "Doctor Strange"},
        location: {uuid: "3353ccb2-3086-11e7-b60e-0800274a5156", name: "location1"},
        person: {display: "Doctor Strange"},
        surgicalAppointments: [],
        startDatetime: "2017-05-24T09:00:00.000+0530",
        endDatetime: "2017-05-24T14:00:00.000+0530"
    };


    xit("should calculate the dimensions of the surgical block", function () {
        scope.surgicalBlock = surgicalBlock;
        scope.calendarStartDatetime = new Date(moment('2017-05-24 09:00:00'));
        scope.calendarEndDatetime = new Date(moment('2017-05-24 16:00:00'));
        scope.gridOffset = {
            top : 0, width : 350, height: 90, left: 100
        };
        scope.dayViewSplit = 30;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        scope.$digest();
        expect(scope.blockDimensions).toEqual();
    });

});