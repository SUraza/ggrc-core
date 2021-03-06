/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import * as AdvancedSearch from '../../plugins/utils/advanced-search-utils';

'use strict';

describe('AdvancedSearch', function () {
  describe('buildFilter() method', function () {
    it('builds correct statuses with "ANY" operator', function () {
      let items = [
        AdvancedSearch.create.state({
          items: ['Active', 'Draft', 'Deprecated'],
          operator: 'ANY',
        }),
      ];
      let expectedResult = '("Status"="Active" ' +
                           'OR "Status"="Draft" ' +
                           'OR "Status"="Deprecated")';

      expect(AdvancedSearch.buildFilter(items))
        .toBe(expectedResult);
    });

    it(`builds correct statuses with "ANY" operator for
      CycleTaskGroupObjectTask`,
      function () {
        let items = [
          AdvancedSearch.create.state({
            items: ['Active', 'Draft', 'Deprecated'],
            operator: 'ANY',
            modelName: 'CycleTaskGroupObjectTask',
          }),
        ];
        let expectedResult = '("Task State"="Active" ' +
                             'OR "Task State"="Draft" ' +
                             'OR "Task State"="Deprecated")';

        expect(AdvancedSearch.buildFilter(items))
          .toBe(expectedResult);
      });

    it('builds correct statuses with "NONE" operator', function () {
      let items = [
        AdvancedSearch.create.state({
          items: ['Active', 'Draft', 'Deprecated'],
          operator: 'NONE',
        }),
      ];
      let expectedResult = '("Status"!="Active" ' +
                           'AND "Status"!="Draft" ' +
                           'AND "Status"!="Deprecated")';

      expect(AdvancedSearch.buildFilter(items))
        .toBe(expectedResult);
    });

    it(`builds correct statuses with "NONE" operator for
      CycleTaskGroupObjectTask`,
      function () {
        let items = [
          AdvancedSearch.create.state({
            items: ['Active', 'Draft', 'Deprecated'],
            operator: 'NONE',
            modelName: 'CycleTaskGroupObjectTask',
          }),
        ];
        let expectedResult = '("Task State"!="Active" ' +
                             'AND "Task State"!="Draft" ' +
                             'AND "Task State"!="Deprecated")';

        expect(AdvancedSearch.buildFilter(items))
          .toBe(expectedResult);
      });

    it('builds correct filter string', function () {
      let items = [
        AdvancedSearch.create.state({
          items: ['Active', 'Draft'],
          operator: 'ANY',
        }),
        AdvancedSearch.create.operator('AND'),
        AdvancedSearch.create.attribute({
          field: 'Title',
          operator: '~',
          value: ' test',
        }),
        AdvancedSearch.create.operator('OR'),
        AdvancedSearch.create.group([
          AdvancedSearch.create.attribute({
            field: 'Para',
            operator: '=',
            value: 'meter',
          }),
          AdvancedSearch.create.operator('AND'),
          AdvancedSearch.create.attribute({
            field: 'Other',
            operator: '~=',
            value: 'value ',
          }),
        ]),
      ];
      let expectedResult = '("Status"="Active" OR "Status"="Draft") ' +
                           'AND "Title" ~ "test" ' +
                           'OR ("Para" = "meter" AND "Other" ~= "value")';
      expect(AdvancedSearch.buildFilter(items))
        .toBe(expectedResult);
    });

    it('builds correct mapping filters', function () {
      let items = [
        AdvancedSearch.create.mappingCriteria({
          objectName: 'product',
          filter: AdvancedSearch.create.attribute({
            field: 'title',
            operator: '~',
            value: 'A',
          }),
          mappedTo: AdvancedSearch.create.mappingCriteria({
            objectName: 'system',
            filter: AdvancedSearch.create.attribute({
              field: 'title',
              operator: '~',
              value: 'B',
            }),
          }),
        }),
        AdvancedSearch.create.operator('AND'),
        AdvancedSearch.create.mappingCriteria({
          objectName: 'control',
          filter: AdvancedSearch.create.attribute({
            field: 'title',
            operator: '~',
            value: 'C',
          }),
          mappedTo: AdvancedSearch.create.group([
            AdvancedSearch.create.mappingCriteria({
              objectName: 'system',
              filter: AdvancedSearch.create.attribute({
                field: 'title',
                operator: '~',
                value: 'D',
              }),
            }),
            AdvancedSearch.create.operator('OR'),
            AdvancedSearch.create.mappingCriteria({
              objectName: 'system',
              filter: AdvancedSearch.create.attribute({
                field: 'title',
                operator: '~',
                value: 'E',
              }),
            }),
          ]),
        }),
      ];
      let expectedFilters = '#__previous__,1# AND #__previous__,4#';
      let expectedRequest = [
        {
          object_name: 'system',
          type: 'ids',
          filters: {
            expression: {
              left: 'title',
              op: {name: '~'},
              right: 'B',
            },
          },
        },
        {
          object_name: 'product',
          type: 'ids',
          filters: {
            expression: {
              left: {
                left: 'title',
                op: {name: '~'},
                right: 'A',
              },
              op: {name: 'AND'},
              right: {
                object_name: '__previous__',
                op: {name: 'relevant'},
                ids: ['0'],
              },
            },
          },
        },
        {
          object_name: 'system',
          type: 'ids',
          filters: {
            expression: {
              left: 'title',
              op: {name: '~'},
              right: 'D',
            },
          },
        },
        {
          object_name: 'system',
          type: 'ids',
          filters: {
            expression: {
              left: 'title',
              op: {name: '~'},
              right: 'E',
            },
          },
        },
        {
          object_name: 'control',
          type: 'ids',
          filters: {
            expression: {
              left: {
                left: 'title',
                op: {name: '~'},
                right: 'C',
              },
              op: {name: 'AND'},
              right: {
                left: {
                  object_name: '__previous__',
                  op: {name: 'relevant'},
                  ids: ['2'],
                },
                op: {name: 'OR'},
                right: {
                  object_name: '__previous__',
                  op: {name: 'relevant'},
                  ids: ['3'],
                },
              },
            },
          },
        },
      ];
      let request = [];

      let result = AdvancedSearch.buildFilter(items, request);

      expect(result).toBe(expectedFilters);
      expect(JSON.parse(JSON.stringify(request))).toEqual(expectedRequest);
    });
  });
});
