/*
 Copyright (C) 2018 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {
  buildModifiedACL,
  buildModifiedListField,
} from '../../plugins/utils/object-history-utils';
import {caDefTypeName} from '../../plugins/utils/custom-attribute/custom-attribute-config';
import template from './templates/restore-revision.mustache';
const tag = 'restore-revision';

export default can.Component.extend({
  tag,
  template,
  viewModel: {
    instance: {},
    restoredRevision: {},
    loading: false,
    restore(element) {
      const instance = this.attr('instance');
      const diff = this.attr('restoredRevision.diff_with_current');
      let attrValues;

      if (!diff || !instance) {
        return;
      }

      this.attr('loading', true);
      attrValues = diff.attr('custom_attribute_values');

      this.applyFields(instance, diff.attr('fields'));
      this.applyFields(instance, diff.attr('mapping_fields'));
      this.applyAcl(instance, diff.attr('access_control_list'));
      this.applyListFields(instance, diff.attr('mapping_list_fields'));

      // use legacy approach to save custom attribute
      this.applyCustomAttributes(instance, attrValues);

      this.saveInstance(instance, element);
    },
    saveInstance(instance, element) {
      instance.save().then(() => {
        this.attr('loading', false);
        this.closeDiff(element);
      });
    },
    applyFields(instance, modifiedFields) {
      const fieldNames = can.Map.keys(modifiedFields);

      fieldNames.forEach((fieldName) => {
        const modifiedField = modifiedFields[fieldName];
        instance.attr(fieldName, modifiedField);
      });
    },
    applyAcl(instance, modifiedRoles) {
      const modifiedACL = buildModifiedACL(instance, modifiedRoles);
      instance.attr('access_control_list', modifiedACL);
    },
    applyListFields(instance, modifiedFields) {
      const fieldNames = can.Map.keys(modifiedFields);
      fieldNames.forEach((fieldName) => {
        const items = instance.attr(fieldName);
        const modifiedItems = modifiedFields.attr(fieldName);
        const modifiedField = buildModifiedListField(items, modifiedItems);
        instance.attr(fieldName, modifiedField);
      });
    },
    applyCustomAttributes(instance, modifiedAttributes) {
      modifiedAttributes.each((modifiedAttribute, caId) => {
        const valueForPerson = _.get(
          modifiedAttribute, 'attribute_object.id'
        ) || null;
        const caDef = _.find(GGRC.custom_attr_defs, (gca) => 
          gca.id === Number(caId)
        );
        const isPerson = caDefTypeName.MapPerson === caDef.attribute_type;
        const value = isPerson 
          ? valueForPerson
          : modifiedAttribute.attribute_value;
        instance.customAttr(caId, value);
      });
    },
    closeDiff(element) {
      // TODO: fix
      $(element).closest('.modal').find('.modal-dismiss').trigger('click');
    },
  },
});
