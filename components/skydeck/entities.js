import React from "react";
import { Frame, Scroll, Header, Entity } from "components/skydeck";

import CompactEntity from "components/compact/entity";
import EntityGroup from "lib/community/entityGroup";
import { addEntityWidget } from "components/skydeck";

export default function Entities({ addWidget, community, api }) {
  var entityGroup = new EntityGroup({ community });
  var entities = entityGroup.getFilteredEntities();

  let onClick = (entity) => () => addEntityWidget(entity, addWidget);

  return (
    <Frame api={api}>
      <Scroll>
        <div className="flex flex-col px-4 mt-4">
          <div className="flex flex-wrap text-xs">
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
