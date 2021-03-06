/*
    Copyright (C) 2018 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/


(function(can) {

  can.Model.Join("CMS.Models.TaskGroupObject", {
    root_object: "task_group_object",
    root_collection: "task_group_objects",
    join_keys: {
      "task_group": CMS.Models.TaskGroup,
      "object": can.Model.Cacheable,
    },
    attributes: {
      context: "CMS.Models.Context.stub",
      modified_by: "CMS.Models.Person.stub",
      task_group: "CMS.Models.TaskGroup.stub",
      object: "CMS.Models.get_stub",
    },
    findAll: "GET /api/task_group_objects",
    create: "POST /api/task_group_objects",
    update: "PUT /api/task_group_objects/{id}",
    destroy: "DELETE /api/task_group_objects/{id}",
  }, {
  });
})(window.can);
