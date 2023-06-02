import "styles/globals.css";
import { MDXProvider } from "@mdx-js/react";
import Layout from "components/layouts/mdx/default";
import Placeholder from "components/mdx/placeholder";
import Graph from "components/graph";
import Callout from "components/mdx/callout";
import Blockquote from "components/mdx/blockquote";
import Code from "components/mdx/code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  faShuffle,
  faExpand,
  faSquare,
  faSort,
  faKeyboard,
} from "@fortawesome/free-solid-svg-icons";
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
  faKeyboard
);

import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

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

function MyApp({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  );
}

export default MyApp;
