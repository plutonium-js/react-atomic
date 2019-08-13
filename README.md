# Plutonium Atomic - [react animation component]

### About
Atomic is an ultra lightweight React component that simplifies the management and control of CSS animations.
   * Define pure CSS keyframe or transition style animations directly in the JSX
   * Control play states such as 'running', 'pause', 'reset', 'cancel', 'to', and 'from'
   * Easily pause, reverse, reset, and more from any event
   * Add state to CSS key frame at-rules ('@keyframe')
   * All standard CSS features are supported such as delay, direction, duration, ease, etc...
   * Add any child components and elements without conflict


### Links

* [Atomic Home](https://plutonium.dev/wp/libraries/react-atomic/)
   * [Documentation](https://plutonium.dev/wp/libraries/react-atomic/documentation)
   * [API](https://plutonium.dev/wp/libraries/react-atomic/api/)


### Bookmarks
* [Installation](#Installation)
* [Usage](#Usage)
   * [Module](#Module)
   * [CDN Script Tags](#CDN-Script-Tags)
* [Create Component](#create_component)
* [Animate](#animate)
* [Key Frames or Transitions](#key_frames_or_transitions)
* [Adding State](#adding_state)
* [Controlling](#controlling)
* [License](#License)


### <a id="Installation"></a>Installation
```
> npm install @plutonium-js/react-atomic
```

**[:arrow_up_small:](#bookmarks)**	

### <a id="Usage" style="color:yellow;"></a>Usage

* <a id="Module"></a>**Module**
   
   Using ES...
   ```javascript
   import Atomic from '@plutonium-js/react-atomic';
   ```
   Or when using CommonJS...
   ```javascript
   const {Atomic} = require('@plutonium-js/react-atomic');
   ```
   
* <a id="CDN-Script-Tags"></a>**CDN Script Tag**
   
    Add the component directly to a web page.
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@plutonium-js/react-atomic@1/dist/bundle.min.js"></script>
   ```

**[:arrow_up_small:](#bookmarks)**	
   
### <a id="create_component"></a>Create Component
To create a basic Atomic component, add the 'Atomic' tag to your JSX. Your content can be any text, elements, or other React components.
```jsx
class App extends Component {
   render() {
      return (
         <Atomic>your content here</Atomic>
      );
   }
}
```

**[:arrow_up_small:](#bookmarks)**	

### <a id="animate"></a>Animate
To animate an Atomic component add the animate property. The example below fades in the element while rotating it one revolution.
```jsx
render() {
   return <Atomic
      animate = {{
         keyframes:`
            from {
               transform:rotate(0deg);opacity:0;
            }
            to {
               transform:rotate(360deg);opacity:1;
            }
         `,
         animation:"2s ease",
         playState:'running'
       }}
   >Plutonium Atomic!</Atomic>;
}
```

**[:arrow_up_small:](#bookmarks)**	
   
### <a id="key_frames_or_transitions"></a>Key Frames or Transitions
Animations can be defined using CSS key frames or transitions (only use one method per component and not both).  For key frames, provide standard CSS at-rule syntax as a string. (the example below uses an ES6 template string)
```javascript
keyframes:`
   from {
      transform:rotate(0deg);opacity:0;
   }
   to {
      transform:rotate(360deg);opacity:1;
   },
   animation:"2s ease",
   playState:'running'
`
```
To use transitions...
```javascript
transitions:{
   transform:{
      from:'rotate(0deg)',
	  to:'rotate(360deg)'
   },
   opacity:{
      from:0,
	  to:1
   }
   animation:"2s ease",
   playState:'running'
}
```
With transforms the 'to' value is required. With both key frames and transforms the 'from' value is optional.  If 'from' is omitted the animation or transition will start at the elements applied style value.

**[:arrow_up_small:](#bookmarks)**	

### <a id="adding_state"></a>Adding State
Add state to any part of the animate property or the entire value.  When rendering animate state changes, Atomic resets the animation and resumes the current play state.

TIP: To add state to an ES6 template string (backtick '`' enclosed content) use the standard interpolation data syntax '${data}'...
```jsx
keyframes:`
   from {
      transform:rotate(0deg);
   }
   to {
      transform:rotate(${this.state.myRotation}deg);
   }
`
```

**[:arrow_up_small:](#bookmarks)**	

### <a id="controlling"></a>Controlling
The API exposes the 'setPlayState' method for controlling animations.  The example below resets the key frame animation when clicking the element.
```jsx
return <Atomic
   ref = {this.myAtomicElm = React.createRef()}
   onClick = {e => {
      this.myAtomicElm.current.setPlayState('reset');
   }}
   animate = {{
      keyframes:`
         from {
            transform:rotate(0deg);
         }
         to {
            transform:rotate(360deg);
         }
      `,
      animation:"2s ease",
      playState:'running'
   }}
>Plutonium Atomic!</Atomic>;
```
Supported key frame play state types...
  * 'running'
  * 'paused'
  * 'toggle' (toggles between 'running' and 'paused')
  * 'reset'
  * 'cancel'
  * 'none'

Supported transition play state types...

  * 'to'
  * 'from'
  * 'running' (same as 'to')
  * 'paused' (same as 'from')
  * 'toggle' (toggles between 'to' and 'from')
  * 'reset'
  * 'cancel'
  * 'none'

**[:arrow_up_small:](#bookmarks)**	

### <a id="License"></a>License

Released under the [MIT license](LICENSE.md)

Author: Jesse Dalessio / [Plutonium.dev](https://plutonium.dev)

**[:arrow_up_small:](#bookmarks)**