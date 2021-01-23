// in built function like lodash comes here
import "../modules/in-built";
// styles imported here
import "../styles/style.scss";

import { AppProps } from "next/app";
import { ReactElement } from "react";

import { EventEmitter } from "../modules/EventEmitter";

function App({ Component, pageProps }: AppProps): ReactElement<AppProps> {
  return (
    <EventEmitter>
      <Component {...pageProps} />
    </EventEmitter>
  );
}

export default App;
