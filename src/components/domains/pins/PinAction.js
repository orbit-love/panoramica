import React, { useCallback, useState } from "react";
import classnames from "classnames";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import GetPinsQuery from "src/graphql/queries/GetPins.gql";
import ConnectPinMutation from "src/graphql/mutations/ConnectPin.gql";
import DisconnectPinMutation from "src/graphql/mutations/DisconnectPin.gql";

export default function PinAction({ project, conversation, className }) {
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

  var pinResult = pinsResult.find((pin) => pin.node.id === conversation.id);
  const [pin, setPin] = useState(pinResult);

  const pinIcon = "location-pin";

  const [connectPin] = useMutation(ConnectPinMutation);
  const [disconnectPin] = useMutation(DisconnectPinMutation);

  const onPin = useCallback(async () => {
    const { id: conversationId } = conversation;
    if (pin) {
      await disconnectPin({
        variables: {
          projectId,
          conversationId,
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
          conversationId,
          createdAt,
          createdAtInt,
        },
      });
      setPin(pin);
    }
  }, [pin, projectId, conversation, connectPin, disconnectPin]);

  return (
    <button
      title="Pin conversation to the portal"
      onClick={onPin}
      className={className}
    >
      <FontAwesomeIcon
        icon={pinIcon}
        className={classnames("text-tertiary", {
          "": pin,
          "opacity-50": !pin,
        })}
      />
    </button>
  );
}
