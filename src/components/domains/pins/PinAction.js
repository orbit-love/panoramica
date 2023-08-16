import React, { useCallback, useState } from "react";
import classnames from "classnames";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import GetPinsQuery from "src/graphql/queries/GetPins.gql";
import ConnectPinMutation from "src/graphql/mutations/ConnectPin.gql";
import DisconnectPinMutation from "src/graphql/mutations/DisconnectPin.gql";

export default function PinAction({ project, activity, className }) {
  const { id: projectId } = project;
  const {
    data: {
      projects: [
        {
          pinsConnection: { edges: pinsResult },
        },
      ],
    },
  } = useSuspenseQuery(GetPinsQuery, {
    variables: {
      projectId,
    },
  });

  var pinResult = pinsResult.find((pin) => pin.node.id === activity.id);
  const [pin, setPin] = useState(pinResult);

  const pinIcon = "location-pin";

  const [connectPin] = useMutation(ConnectPinMutation);
  const [disconnectPin] = useMutation(DisconnectPinMutation);

  const onPin = useCallback(async () => {
    const { id: activityId } = activity;
    if (pin) {
      await disconnectPin({
        variables: {
          projectId,
          activityId,
        },
      });
      setPin(null);
    } else {
      const createdAt = new Date();
      const createdAtInt = Date.parse(createdAt);
      const {
        data: {
          updateProjects: {
            projects: [
              {
                pinsConnection: {
                  edges: [pin],
                },
              },
            ],
          },
        },
      } = await connectPin({
        variables: {
          projectId,
          activityId,
          createdAt,
          createdAtInt,
        },
      });
      setPin(pin);
    }
  }, [pin, projectId, activity, connectPin, disconnectPin]);

  return (
    <button
      title="Pin conversation to the portal"
      onClick={onPin}
      className={className}
    >
      <FontAwesomeIcon
        icon={pinIcon}
        className={classnames({
          "text-tertiary": pin,
          "text-gray-500": !pin,
        })}
      />
    </button>
  );
}
