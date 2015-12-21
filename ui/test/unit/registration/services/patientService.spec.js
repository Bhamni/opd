'use strict';

describe('Patient resource', function () {
    var patientService, offlineService;
    var patient;
    var _offlineService = jasmine.createSpyObj('offlineService', ['offline']);

    var openmrsUrl = "http://blah";
    var patientConfiguration;

    var mockHttp = {
        defaults: {headers: {common: {'X-Requested-With': 'present'}}},
        get: jasmine.createSpy('Http get').and.returnValue({
            'success': function(onSuccess){
                return onSuccess({name:"john"});
            }
        }),
        post: jasmine.createSpy('Http post').and.returnValue({
            'success': function (onSuccess) {
                return {
                    'then': function (thenMethod) {
                        thenMethod()
                    },
                    'error': function (onError) {
                        onError()
                    }
                }
            }})
    };

    var mappedPatient = {
        names: [
            {givenName: "someGivenName", familyName: "someFamilyName"}
        ],
        age: 21,
        gender: "M"};

    beforeEach(function () {
        module('bahmni.registration');
        module('bahmni.offline');

        module(function ($provide) {
            Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
            $provide.value('$http', mockHttp);
            $provide.value('offlineService', _offlineService);
        });


        patientConfiguration = new Bahmni.Registration.PatientConfig([
            {"uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "caste", "description": "Caste", "format": "java.lang.String", "answers": []},
            {"uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "class", "description": "Class", "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "conceptId": "10"}
                ]}
        ]);

        inject(['patientService', '$rootScope', 'patient', '$q', function (patientServiceInjectted, $rootScope, patientFactory) {
            patient = patientFactory.create();
            patientService = patientServiceInjectted;
            $rootScope.patientConfiguration = patientConfiguration;
        }]);

    });

    var mockOfflineService = function () {
        _offlineService.offline.and.callFake(function () {
            return false;
        });
    };


    it('Should call url for search', function () {
        var query = 'john';
        mockOfflineService();
        var results = patientService.search(query);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniSearchUrl + "/patient");
        expect(mockHttp.get.calls.mostRecent().args[1].params.q).toBe(query);
        expect(results.$$state.value.name).toBe('john');

    });

    it('Should create a patient', function () {
        mockOfflineService();
        angular.extend(patient, {
            "gender": "M",
            "givenName": "someGivenName",
            "familyName": "someFamilyName",
            "age": {
                days: 23,
                months: 2,
                years: 1
            },
            "centerID": {
                name: "GAN"
            }
        });
        var results = patientService.create(patient, function () {
        }, function () {
        });

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe('/openmrs/ws/rest/v1/patientprofile');
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.gender).toEqual("M");
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.names[0].givenName).toEqual("someGivenName");
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.names[0].familyName).toEqual("someFamilyName");
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.birthdate).toEqual(moment().subtract('days', 23).subtract('months', 2).subtract('years', 1).format('YYYY-MM-DD'));
        expect(mockHttp.post.calls.mostRecent().args[2].headers['Content-Type']).toBe('application/json');
        expect(mockHttp.post.calls.mostRecent().args[2].headers['Accept']).toBe('application/json');
    });
});
