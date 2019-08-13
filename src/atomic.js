//Plutonium - [react-atomic] - An ultra lightweight CSS animation and transition simplifier / controller component.
/*
 * Plutonium [react-atomic]
 * (c) 2019 Jesse Dalessio - https://plutonium.dev
 * Released under the MIT license
*/
import React from 'react';
import PropTypes from 'prop-types';

//create the plutonium global context '_$PU' if not already present
const _T = window!==undefined?window:global!==undefined?global:this!==undefined?this:module!==undefined?module:{};
const _PU = _T._$PU = _T._$PU||{};

//library of data and utility type methods
const _LIB = _PU.reactAtomicLib = _PU.reactAtomicLib||new function() {
	
	//utility methods
	this.util = new function(){
		const _T = this;
		this.uids = {};
		
		//get a unique id
		this.getUid = function(){
			while (true) {
				let uid = _get();
				if (!_T.uids[uid]) return (_T.uids[uid]=uid);
			}
			function _get() {
				let uid = Math.random().toString(36).substr(2, 8).toUpperCase();
				return uid.replace(/^\d/,'Z');
			}
		}
	
		//parse camel case property name (e.g. borderWidth to border-width)
		this.parseCamelCase = function(name, delimiter) {
			return  (name+'').replace(/([a-zA-Z])(?=[A-Z])/g, '$1'+(delimiter||'-')).toLowerCase();
		}
		
		//compare - pass an array containing any number of intrinsic values, other arrays, or data objects (returns true if the same - default is a shallow compare, go deep with {deep:true})
		//note: use the param 'details' option to return an object containing the compare result and an array of keyPaths representing the tree path to the occurrence of differing values.
		//note: don't pass functions or you will lock up the browser tab as this method will endlessly loop
		this.compare = function(objs, params, details, keyPath) {
			params = params||{};
			let result = false;
			details = details||(params.details?{keyPaths:[]}:null);
			const keys = objs.map(obj => obj!=null?Object.keys(obj):[]);
			if (!keys.find(item => keys[0].length!==item.length)) {
				result=true; for (let i=0, key;(key=keys[0][i]) && i<keys[0].length;i++) {
					const vals = objs.map(obj => obj[key]);
					if (params.deep && vals.filter(val => typeof val==="object").length===vals.length) {
						if (!(result = _T.compare(vals, params, details, (keyPath?keyPath+'.':'')+key))) break;
					}
					else if (!(result=vals.find(val => vals[0]!==val)===undefined)) {
						if (details) details.keyPaths.push(keyPath+'.'+key);
						else break;
					}
				}
				if (keys[0].length==0 && objs.find(obj => objs[0]!==obj)!==undefined) result = false;
			}
			else if (details) details.keyPaths.push(keyPath);
			if (details) details.result = !details.keyPaths.length;
			return details||result;
		}
	}
	
	//animate methods
	this.animate = new function(){
		const _T = this;
		this.animations = {};
		
		//add a new animation
		this.add = function(_COMP, uid, data) {
			if (data) {
				const d=document;
				const animation = _T.animations[uid] = _T.animations[uid]||{
					data:data,
					qty:1
				};
				let sheet = animation.sheet; if (!sheet) {
					d.head.appendChild(d.createElement('style'));
					sheet = animation.sheet = d.styleSheets[d.styleSheets.length-1];
				}
				else for (let i=sheet.rules.length-1;i>=0;i--) sheet.deleteRule(i);
				const selector = (_COMP.props.id?'#'+_COMP.props.id:'')+'.PU-'+_COMP.uid+'-'+uid;
				if (data.keyframes) {
					for (let i=0;i<2;i++) {
						let ri = (i*2);
						sheet.insertRule('@keyframes '+_COMP.uid+'-'+uid+'-'+i+'{'+data.keyframes+'}', 0+ri);
						sheet.insertRule(selector+'.PU-alternate-'+i+' {animation:'+_COMP.uid+'-'+uid+'-'+i+' '+(data.animation||'2s both')+';}', 1+ri);
					}
					sheet.insertRule(selector+'.PU-anim-state-paused {animation-play-state:paused;', 4);
					sheet.insertRule(selector+'.PU-anim-state-cancel,'+selector+'.PU-anim-state-reset {animation:unset;', 5);
				}
				else if (data.transitions) {
					let toVals = '', fromVals = '', anims = '';
					animation.qty=0; for (let i in data.transitions) {
						const cssStyleName = _LIB.util.parseCamelCase(i);
						let trans = data.transitions[i];
						if (trans.hasOwnProperty('to')) toVals += cssStyleName+':'+trans.to+';';
						if (trans.hasOwnProperty('from')) fromVals += cssStyleName+':'+trans.from+';';
						anims += (anims?',':'')+cssStyleName+' '+(trans.animation||data.animation);
						animation.qty++;
					}
					const rules = sheet.rules;
					sheet.insertRule(selector+' {transition:'+anims+';'+fromVals+'}', rules.length);
					sheet.insertRule(selector+'.PU-trans-state-to {'+toVals+'}', rules.length);
					sheet.insertRule(selector+'.PU-trans-state-from {'+fromVals+'}', rules.length);
					sheet.insertRule(selector+'.PU-trans-state-cancel,'+selector+'.PU-trans-state-reset {transition:none;}', rules.length);
				}
			}
		}
		
		//tween a value
		this.tween = function(time, startVal, endVal, duration, easeType) {
			let val = startVal;
			if (duration && startVal!==endVal) {
				let type = (easeType||'quadratic-inout').replace(/ease/i,"quadratic").replace(/in\-out/i,"inout").split('-');
				const ease = (this.ease[type[1]||'inout']||(()=>{}))[type[0]]||this.ease.inout.quadratic;
				val = ease(time, startVal, endVal-startVal, duration);
			}
			return val;
		}
		
		//easing functions
		this.ease = {
			in:{
				quadratic:(t,b,c,d) => {return c*(t/=d)*t+b;},
				cubic: (t,b,c,d) => {return c*(t/=d)*t*t + b;},
				quartic:(t,b,c,d) => {return c*(t/=d)*t*t*t + b;},
				quintic:(t,b,c,d) => {return c*(t/=d)*t*t*t*t + b;},
				sinusoidal:(t,b,c,d) => {return -c * Math.cos(t/d * (Math.PI/2)) + c + b;},
				exponential:(t,b,c,d) => {return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;},
				circular:(t,b,c,d) => {return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;},
			},
			out:{
				quadratic:(t,b,c,d) => {return -c *(t/=d)*(t-2) + b;},
				cubic:(t,b,c,d) => {return c*((t=t/d-1)*t*t + 1) + b;},
				quartic:(t,b,c,d) => {return -c * ((t=t/d-1)*t*t*t - 1) + b;},
				quintic:(t,b,c,d) => {return c*((t=t/d-1)*t*t*t*t + 1) + b;},
				sinusoidal:(t,b,c,d) => {return c * Math.sin(t/d * (Math.PI/2)) + b;},
				exponential:(t,b,c,d) => {return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;},
				circular:(t,b,c,d) => {return c * Math.sqrt(1 - (t=t/d-1)*t) + b;},
			},
			inout:{
				linear:(t,b,c,d) => {return c*t/d+b;},
				quadratic:(t,b,c,d) => {if ((t/=d/2) < 1) return c/2*t*t + b;return -c/2 * ((--t)*(t-2) - 1) + b;},
				cubic:(t,b,c,d) => {if ((t/=d/2) < 1) return c/2*t*t*t + b;return c/2*((t-=2)*t*t + 2) + b;},
				quartic:(t,b,c,d) => {if ((t/=d/2) < 1) return c/2*t*t*t*t + b;return -c/2 * ((t-=2)*t*t*t - 2) + b;},
				quintic:(t,b,c,d) => {if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;return c/2*((t-=2)*t*t*t*t + 2) + b;},
				sinusoidal:(t,b,c,d) => {return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;},
				exponential:(t,b,c,d) => {if (t==0) return b;if (t==d) return b+c;if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;},
				circular:(t,b,c,d) => {if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;},
			}
		}
	}
	
	//returns a default root atomic component element.
	this.getRoot = function(_COMP, props) {
		props = props||{};
		let compProps = {..._COMP.props};
		delete compProps.animate;
		return <div
			{...compProps}
			{...props}
			ref = {_COMP.rootRef = React.createRef()}
			className = {_LIB.getRootClassNames(_COMP, props)}
			style = {Object.assign(props.style||{}, _COMP.props.style)}
		>{props.children||_COMP.props.children}</div>;
	}
	
	//returns the root atomic component class names
	this.getRootClassNames = function(_COMP, data) {
		data = data||{};
		return ['PU-Atomic',
			_COMP.name!=='Atomic'?('PU-'+_COMP.name||''):'',
			_COMP.props.className,
			data.className||'',
			'PU-anim-state-'+_COMP.state.animState,
			'PU-trans-state-'+_COMP.state.transState,
			'PU-alternate-'+_COMP.state.alternate
		].join(' ').trim().replace(/  +/,' ');
	}
}

//Plutonium Atomic React component
export class Atomic extends React.Component{
	constructor (props) {
		super(props);
		this._LIB = _LIB;
		this.name = 'Atomic';
		this.state = {
			transState:'none',
			animState:'none',
			alternate:'none'
		}
		this.uid = _LIB.util.getUid();
		this.elms = {};
		this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
		this.playState = 'none';
		this._addAnimation();
	}
	render(elm) {
		elm = elm||_LIB.getRoot(this, {
			className:'PU-'+this.uid+'-root'
		});
		elm.props.onAnimationEnd = elm.props.onTransitionEnd = this.handleAnimationEnd;
		return elm;
	}
	getSnapshotBeforeUpdate(prevProps, prevState) {
		if (!_LIB.util.compare([this._getRootAnimateData(prevProps.animate), this._getRootAnimateData()],{deep:true})) {
			this._addAnimation();
			this.setPlayState('reset', {superOnly:true, resetToPlayState:this.playState});
		}
		return null;
	}
	componentDidUpdate(){}
	componentDidMount() {
		//note: the timeout is required so transitions have a request frame gap between applying to the CSS and running (requestAnimationFrame will not work) 
		setTimeout(() => this.setPlayState((this._getRootAnimateData()||{}).playState||this.playState, {superOnly:true}),0);
	}
		
	//set the play state ('none', 'paused', 'running', 'ended', 'cancel', 'reset')
	setPlayState(type, params) {
		params = params||{};
		if (type==='toggle') type = this.playState==='running'?'paused':this.playState==='paused'?'running':'running';
		const state = {};
		if (/to|from|ended|running|cancel|reset/.test(type) || (type==='paused'&&this.playState==='running')) state.animState = {to:'running',from:'paused'}[type]||type;
		if (type==='running' && /ended|none|reset|cancel/.test(this.state.animState)) state.alternate = this.state.alternate?0:1;
		if (/to|from|running|paused|cancel|reset/.test(type)) state.transState = {running:'to',paused:'from'}[type]||type;
		this.setState(state);
		if (!params.skipReset && type==='reset') requestAnimationFrame(() => {this.setPlayState(params.resetToPlayState||'running')});
		this.playState = type;
	}
	
	//handle animation and transition end
	handleAnimationEnd(e) {
		this.setPlayState('ended', {superOnly:true});
		e.stopPropagation();
	}
	
	//get the root animate data
	_getRootAnimateData(animate) {
		animate = animate||this.props.animate;
		return (animate.keyframes || animate.transitions)?animate:animate.root;
	}
	
	//add animations
	_addAnimation() {
		_LIB.animate.add(this, 'root', this._getRootAnimateData());
	}
}
Atomic.propTypes = {
	animate:PropTypes.object
};
Atomic.defaultProps = {
	animate:{}
};
export default Atomic;


























