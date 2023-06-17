import "styles/globals.css";
import { MDXProvider } from "@mdx-js/react";
import Layout from "components/layouts/mdx/default";
import Placeholder from "components/mdx/placeholder";
import Graph from "components/graph";
import Callout from "components/mdx/callout";
import Blockquote from "components/mdx/blockquote";
import Code from "components/mdx/code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SessionProvider } from "next-auth/react";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner,
  faYinYang,
  faHeartCircleCheck,
  faBuildingColumns,
  faLightbulb,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faArrowsSpin,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faShuffle,
  faExpand,
  faSquare,
  faSort,
  faKeyboard,
  faRightLeft,
} from "@fortawesome/free-solid-svg-icons";

import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";

import {
  faBars,
  faXmark,
  faSolarSystem,
  faPlanetMoon,
  faPlanetRinged,
  faRocketLaunch,
  faCircleNodes,
  faFaceSadCry,
  faTrafficCone,
  faDrawCircle,
  faChartNetwork,
  faChartMixed,
  faTire,
  faBoxCheck,
  faStairs,
  faPause,
  faPlay,
  faCircle1,
  faCircle2,
  faCircle3,
  faCircle4,
  faUserAstronaut,
  faHeart,
  faSignalStream,
  faCircle,
  faQuestion,
} from "@fortawesome/pro-solid-svg-icons";

import { faTelescope } from "@fortawesome/pro-duotone-svg-icons";

// add to library
library.add(
  faBars,
  faXmark,
  faSpinner,
  faYinYang,
  faSolarSystem,
  faPlanetRinged,
  faPlanetMoon,
  faRocketLaunch,
  faCircleNodes,
  faHeartCircleCheck,
  faTrafficCone,
  faFaceSadCry,
  faDrawCircle,
  faChartNetwork,
  faChartMixed,
  faBuildingColumns,
  faTire,
  faBoxCheck,
  faStairs,
  faPause,
  faPlay,
  faCircle1,
  faCircle2,
  faCircle3,
  faCircle4,
  faUserAstronaut,
  faHeart,
  faSignalStream,
  faLightbulb,
  faCircle,
  faArrowsSpin,
  faChevronDown,
  faChevronUp,
  faShuffle,
  faExpand,
  faArrowDown,
  faSquare,
  faQuestion,
  faSort,
  faChevronLeft,
  faKeyboard,
  faArrowLeft,
  faArrowRight,
  faRightLeft,
  faTelescope,
  faTwitter,
  faDiscord
);

import "@fortawesome/fontawesome-svg-core/styles.css";

const components = {
  wrapper: Layout,
  code: Code,
  blockquote: Blockquote,
  FontAwesomeIcon,
  Blockquote,
  Callout,
  Placeholder,
  Graph,
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <MDXProvider components={components}>
        <Component {...pageProps} />
      </MDXProvider>
    </SessionProvider>
  );
}

export default MyApp;
