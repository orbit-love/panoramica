import React from "react";
import { Frame, Scroll, Header, Entity } from "components/skydeck";

import CompactEntity from "components/compact/entity";
import EntityGroup from "lib/community/entityGroup";

export default function Entities(props) {
  let { addWidget } = props;

  var entityGroup = new EntityGroup(props);
  var entities = entityGroup.getFilteredEntities();

  let onClick = (entity) => () =>
    addWidget((props) => <Entity key={entity.id} entity={entity} {...props} />);

  return (
    <Frame>
      <Header {...props}>
        <div>Entities</div>
        <div className="text-indigo-500">{entities.length}</div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4">
          <div className="flex flex-wrap w-56 text-xs">
            {entities.map((entity) => (
              <div key={entity.id} className="px-1 py-1">
                <CompactEntity
                  entity={entity}
                  active={false}
                  onClick={onClick(entity)}
                />
              </div>
            ))}
          </div>
        </div>
      </Scroll>
    </Frame>
  );
}
