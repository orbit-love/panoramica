import "styles/globals.css";
import { MDXProvider } from "@mdx-js/react";
import Layout from "components/mdx/layout";
import Placeholder from "components/mdx/placeholder";
import Graph from "components/mdx/graph";
import Callout from "components/mdx/callout";
import Blockquote from "components/mdx/blockquote";
import Code from "components/mdx/code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner,
  faYinYang,
  faHeartCircleCheck,
  faBuildingColumns,
  faLightbulb,
  faChevronDown,
  faChevronUp,
  faArrowsSpin,
  faShuffle,
  faExpand,
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
  faExpand
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
  Orbit1,
  Orbit2,
  Orbit3,
  Orbit4,
};

function MyApp({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  );
}

export default MyApp;
