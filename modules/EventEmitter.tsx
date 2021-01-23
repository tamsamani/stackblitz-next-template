/**
 * EventEmitter using React Hooks
 * @author tamsamani
 * @copyright tousfactuers - 2020
 * ================================
 * inspired : https://medium.com/@dominikdosoudil/building-event-emitter-using-react-hooks-650f94a057ea
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from "react";

type EventEmitterContextPayload = any;

type EventEmitterContextCallback = (
  payload: EventEmitterContextPayload
) => void;

type EventEmitterContextFunction<T> = (
  event: string,
  callbackOrPayload: T
) => void;

type EventEmitterContextSubscribe = EventEmitterContextFunction<
  EventEmitterContextCallback
>;
type EventEmitterContextDispatch = EventEmitterContextFunction<
  EventEmitterContextPayload
>;

type EventEmitterContextSubscribers = Record<
  string,
  EventEmitterContextCallback[]
>;

type EventEmitterContextActionType = "subscribe" | "unsubscribe";
type EventEmitterContextAction = {
  type: EventEmitterContextActionType;
  event: string;
  callback: EventEmitterContextCallback;
};

type EventEmitterContextCore = [
  EventEmitterContextSubscribe,
  EventEmitterContextSubscribe,
  EventEmitterContextDispatch
];

export const EventContext: React.Context<
  EventEmitterContextCore
> = createContext<EventEmitterContextCore>([
  (_event, _callback) => {}, // subscribe
  (_event, _callback) => {}, // unsubscribe
  (_event, _payload) => {} // dispatch
]);

// use event dispatcher hook
export const useEventDispatch: EventEmitterContextDispatch = () => {
  const [_subscribe, _unsubscribe, dispatch] = useContext(EventContext);
  return dispatch;
};

// use event creator hook
export const useEvent: EventEmitterContextSubscribe = (event, callback) => {
  const [subscribe, unsubscribe, _dispatch] = useContext(EventContext);

  useEffect(() => {
    subscribe(event, callback);
    return () => unsubscribe(event, callback);
  }, [subscribe, unsubscribe, event, callback]);
};

/** use combined events instead of use each one
 *
 * > danger: events should be a static in the whole of application!\
 * if use dynamic ways to fetch events, make sure you're fixed counting it
 * outside the target Component, or it will break when re-rendering. this is not
 * a bug, its how react hooks works.
 *
 * > don't try optimize this hooks, its should be as expressed or did not works.\
 * for know why, read about custom Hooks in react and how its works!!
 */
export const useEvents = (
  events: Record<string, EventEmitterContextCallback>
): void => {
  for (const [event, callback] of Object.entries(events)) {
    useEvent(event, callback);
  }
};

export const EventEmitter: React.FC = ({ children }) => {
  const [subscribers, dispatch] = useReducer(
    (
      state: EventEmitterContextSubscribers,
      action: EventEmitterContextAction
    ) => {
      const { type, event } = action;

      switch (type) {
        case "subscribe": {
          const { callback } = action;
          if (event in state) {
            if (state[event].includes(callback)) {
              return state;
            }
            return { ...state, [event]: [...state[event], callback] };
          }
          return { ...state, [event]: [callback] };
        }

        case "unsubscribe": {
          const { callback } = action;
          if (event in state && state[event].includes(callback)) {
            return {
              ...state,
              [event]: [...state[event].filter(cb => cb !== callback)]
            };
          }
          return state;
        }

        default:
          throw new Error();
      }
    },
    {} as EventEmitterContextSubscribers,
    () => ({})
  );

  const subscribe: EventEmitterContextSubscribe = useCallback(
    (event, callback) => {
      dispatch({ type: "subscribe", event, callback });
    },
    [dispatch]
  );

  const unsubscribe: EventEmitterContextSubscribe = useCallback(
    (event, callback) => {
      dispatch({ type: "unsubscribe", event, callback });
    },
    [dispatch]
  );

  const dispatchEvent: EventEmitterContextDispatch = useCallback(
    (event, payload) => {
      if (event in subscribers) {
        subscribers[event].forEach(cb => cb(payload));
      }
    },
    [subscribers]
  );

  const eventPack: EventEmitterContextCore = useMemo(
    () => [subscribe, unsubscribe, dispatchEvent],
    [subscribe, unsubscribe, dispatchEvent]
  );

  return (
    <EventContext.Provider value={eventPack}>{children}</EventContext.Provider>
  );
};
