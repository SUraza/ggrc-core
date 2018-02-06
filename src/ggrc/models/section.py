# Copyright (C) 2018 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

from ggrc import db
from ggrc.access_control.roleable import Roleable
from ggrc.fulltext.mixin import Indexed
from ggrc.models.comment import Commentable
from ggrc.models.directive import Directive
from ggrc.models.deferred import deferred
from ggrc.models import mixins
from ggrc.models.object_document import PublicDocumentable
from ggrc.models.object_person import Personable
from ggrc.models import reflection
from ggrc.models.relationship import Relatable
from ggrc.models.relationship import Relationship
from ggrc.models.track_object_state import HasObjectState


class Section(Roleable,
              HasObjectState,
              mixins.Hierarchical,
              mixins.CustomAttributable,
              mixins.WithStartDate,
              mixins.WithLastDeprecatedDate,
              Personable,
              Relatable,
              Indexed,
              Commentable,
              mixins.TestPlanned,
              PublicDocumentable,
              mixins.BusinessObject,
              db.Model):

  __tablename__ = 'sections'
  _table_plural = 'sections'
  _aliases = {
      "document_url": None,
      "document_evidence": None,
      "description": "Text of Section",
      "directive": {
          "display_name": "Policy / Regulation / Standard / Contract",
          "type": reflection.AttributeInfo.Type.MAPPING,
          "filter_by": "_filter_by_directive",
      }
  }

  na = deferred(db.Column(db.Boolean, default=False, nullable=False),
                'Section')
  notes = deferred(db.Column(db.Text, nullable=False, default=u""), 'Section')

  _api_attrs = reflection.ApiAttributes('na', 'notes')
  _sanitize_html = ['notes']
  _include_links = []

  @classmethod
  def _filter_by_directive(cls, predicate):
    types = ["Policy", "Regulation", "Standard", "Contract"]
    dst = Relationship.query \
        .filter(
            (Relationship.source_id == cls.id) &
            (Relationship.source_type == cls.__name__) &
            (Relationship.destination_type.in_(types))) \
        .join(Directive, Directive.id == Relationship.destination_id) \
        .filter(predicate(Directive.slug) | predicate(Directive.title)) \
        .exists()
    src = Relationship.query \
        .filter(
            (Relationship.destination_id == cls.id) &
            (Relationship.destination_type == cls.__name__) &
            (Relationship.source_type.in_(types))) \
        .join(Directive, Directive.id == Relationship.source_id) \
        .filter(predicate(Directive.slug) | predicate(Directive.title)) \
        .exists()
    return dst | src
