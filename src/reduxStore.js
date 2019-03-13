import {createStore, combineReducers} from 'redux';

let myState={id : 0, name: 'bruno'}
const reducer =(state=myState,action)=>{
  if(action.type==='setInfo'){
    console.log(action.type);
    state = action.payload;
  }
  return state;
};
const reducer2 =(state={no1: 0, no2: 1},action)=>{
  if(action.type==='add'){
    console.log(action.type);
    state = action.payload.no1+action.payload.no2;
  }
  return state;
};
const store = createStore(combineReducers({reducer,reducer2}));
store.subscribe(()=>{
  console.log('updated state ',store.getState());
});

store.dispatch({type:"add",payload:{no1: 30.35, no2: 91}});
store.dispatch({type:"setInfo",payload:{id : 1, name: 'alvin'}});