import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export const ChatMessage = ({ icon, classes, children }) => {
  return (
    <div
      className={classnames(
        "flex justify-start px-4 py-4 space-x-3 whitespace-pre-wrap",
        classes
      )}
    >
      <div className="w-6 text-center">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>{children}</div>
    </div>
  );
};

export const AIMessage = ({ children }) => {
  var classes = "bg-gray-50 dark:bg-gray-900";
  var icon = "robot";
  return (
    <ChatMessage icon={icon} classes={classes}>
      {children}
    </ChatMessage>
  );
};

export const HumanMessage = ({ children }) => {
  var classes = "dark:bg-gray-950 dark:bg-opacity-50 bg-gray-100";
  var icon = "user";
  return (
    <ChatMessage icon={icon} classes={classes}>
      {children}
    </ChatMessage>
  );
};
