import React from "react";
import { Frame, Scroll, Header, Entity } from "components/skydeck";

import CompactEntity from "components/compact/entity";
import EntityGroup from "lib/community/entityGroup";

export default function Entities(props) {
  let { widgets, setWidgets } = props;

  var entityGroup = new EntityGroup(props);
  var entities = entityGroup.getFilteredEntities();

  let onClickFor = (entity) => {
    return () => {
      setWidgets([
        ...widgets.slice(0, 2),
        (props) => <Entity key={entity.id} entity={entity} {...props} />,
        ...widgets.slice(2, widgets.length),
      ]);
    };
  };

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
              <CompactEntity
                key={entity.id}
                entity={entity}
                active={false}
                onClick={onClickFor(entity)}
              />
            ))}
          </div>
        </div>
      </Scroll>
    </Frame>
  );
}
