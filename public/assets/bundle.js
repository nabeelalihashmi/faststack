
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @description Get durations of CSS transition (enter and leave)
     * @param {string} transitionName
     * @returns {{leavingDuration: number, enteringDuration: number}}
     */
    function getTransitionDurations(transitionName) {
      let enteringDuration = 0;
      let leavingDuration = 0;
      for (let i = 0; i < document.styleSheets.length; i++) {
        let rules = document.styleSheets[i]['rules'];
        for (let k = 0; k < rules.length; k++) {
          if (!rules[k]['selectorText']) continue;
          if (
            rules[k]['selectorText'].indexOf(`.${transitionName}-enter-active`) !==
            -1
          ) {
            const duration = rules[k]['style']['transitionDuration'];
            enteringDuration = getDuration(duration);
          }
          if (
            rules[k]['selectorText'].indexOf(`.${transitionName}-leave-active`) !==
            -1
          ) {
            const duration = rules[k]['style']['transitionDuration'];
            leavingDuration = getDuration(duration);
          }
        }
      }
      return {
        enteringDuration,
        leavingDuration
      };
    }

    function getDuration(_duration) {
      let duration = _duration;
      if (duration.indexOf('ms') !== -1) {
        if (duration.indexOf(',') !== -1) {
          let durArray = duration.split(',');
          durArray.sort(function (a, b) {
            return (
              Number(b.trim().replace('ms', '')) -
              Number(a.trim().replace('ms', ''))
            );
          });
          duration = durArray[0];
        }
        duration = duration.replace('ms', '');
        duration = Number(duration);
      } else if (duration.indexOf('s') !== -1) {
        if (duration.indexOf(',') !== -1) {
          let durArray = duration.split(',');
          durArray.sort(function (a, b) {
            return (
              Number(b.trim().replace('s', '')) - Number(a.trim().replace('s', ''))
            );
          });
          duration = durArray[0];
        }
        if (duration.indexOf('.') === 0) duration = '0' + duration;
        duration = duration.replace('s', '');
        duration = Number(duration) * 1000;
      }
      return duration;
    }

    /**
     * @description Is current environment - browser
     * @author flexdinesh/browser-or-node
     * @returns {boolean}
     */
    function isBrowser$1() {
      return (
        typeof window !== 'undefined' && typeof window.document !== 'undefined'
      );
    }

    /**
     * @description Delay for async functions
     * @param {number} ms
     * @returns {Promise<void>}
     */
    function delay(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    }

    async function componentChangeWithTransition(
      component,
      currentRoute,
      transition,
      classCallback,
      componentCallback,
      router,
      transitionData
    ) {
      classCallback(`${transition}-leave-active ${transition}-leave-to`);
      await delay(transitionData.leavingDuration + 10);
      classCallback(
        `${transition}-leave-active ${transition}-leave-to ${transition}-leave`
      );
      const hooksArray = [...router.transitionOutHooks];
      if (currentRoute.transitionOut) hooksArray.push(currentRoute.transitionOut);
      await router.runHooksArray(
        hooksArray,
        router.currentRouteData.getValue,
        router.currentRouteFromData.getValue,
        'transition'
      );
      await delay(5);
      classCallback(`${transition}-enter`);
      classCallback(`${transition}-enter-active`);
      componentCallback(component);
      classCallback(`${transition}-enter-active ${transition}-enter-to`);
      await delay(transitionData.enteringDuration + 10);
      classCallback('');
    }

    /* node_modules/@easyroute/svelte/lib/RouterOutlet.svelte generated by Svelte v3.43.1 */

    const { Error: Error_1$2 } = globals;
    const file$4 = "node_modules/@easyroute/svelte/lib/RouterOutlet.svelte";

    // (68:4) {#if firstRouteResolved}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*currentComponent*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { router: /*router*/ ctx[3] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*currentComponent*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(68:4) {#if firstRouteResolved}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let if_block = /*firstRouteResolved*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = 'easyroute-outlet ' + /*$$restProps*/ ctx[5].class + ' ' + /*transitionClassName*/ ctx[1]);
    			add_location(div, file$4, 66, 0, 2432);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*firstRouteResolved*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*firstRouteResolved*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$$restProps, transitionClassName*/ 34 && div_class_value !== (div_class_value = 'easyroute-outlet ' + /*$$restProps*/ ctx[5].class + ' ' + /*transitionClassName*/ ctx[1])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const omit_props_names = ["transition","forceRemount","name"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $currentMatched;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RouterOutlet', slots, []);
    	let { transition = null, forceRemount = false, name = 'default' } = $$props;
    	const SSR_CONTEXT = !isBrowser$1();
    	const context = getContext('easyrouteContext');
    	const depth = context ? context.depth + 1 || 0 : 0;
    	const router = context ? context.router : null;

    	const transitionData = SSR_CONTEXT
    	? null
    	: transition ? getTransitionDurations(transition) : null;

    	let prevRouteId = null;
    	let currentComponent = null;
    	let transitionClassName = '';
    	let firstRouteResolved = SSR_CONTEXT;

    	if (!router) {
    		throw new Error('[Easyroute] RouterOutlet: no router instance found. Did you forget to wrap your ' + 'root component with <EasyrouteProvider>?');
    	}

    	const currentMatched = router.currentMatched;
    	validate_store(currentMatched, 'currentMatched');
    	component_subscribe($$self, currentMatched, value => $$invalidate(9, $currentMatched = value));
    	setContext('easyrouteContext', { depth, router });

    	async function changeComponent(component, currentRoute) {
    		if (prevRouteId === currentRoute.id && !forceRemount) return;

    		if (!transitionData) {
    			$$invalidate(0, currentComponent = component);
    		} else {
    			componentChangeWithTransition(component, currentRoute, transition, tcn => $$invalidate(1, transitionClassName = tcn), c => $$invalidate(0, currentComponent = c), router, transitionData);
    		}

    		prevRouteId = currentRoute.id;
    	}

    	async function pickRoute(routes) {
    		const currentRoute = routes.find(route => route.nestingDepth === depth);

    		if (currentRoute) {
    			let component;

    			if (name === 'default') component = currentRoute.component || currentRoute.components.default; else component = currentRoute.components
    			? currentRoute.components[name]
    			: null;

    			await changeComponent(component, currentRoute);
    			$$invalidate(2, firstRouteResolved = true);
    		} else {
    			changeComponent(null, `${Date.now()}-nonexistent-route`);
    		}
    	}

    	SSR_CONTEXT && pickRoute(router.currentMatched.getValue);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('transition' in $$new_props) $$invalidate(6, transition = $$new_props.transition);
    		if ('forceRemount' in $$new_props) $$invalidate(7, forceRemount = $$new_props.forceRemount);
    		if ('name' in $$new_props) $$invalidate(8, name = $$new_props.name);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		onDestroy,
    		getTransitionDurations,
    		isBrowser: isBrowser$1,
    		componentChangeWithTransition,
    		transition,
    		forceRemount,
    		name,
    		SSR_CONTEXT,
    		context,
    		depth,
    		router,
    		transitionData,
    		prevRouteId,
    		currentComponent,
    		transitionClassName,
    		firstRouteResolved,
    		currentMatched,
    		changeComponent,
    		pickRoute,
    		$currentMatched
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('transition' in $$props) $$invalidate(6, transition = $$new_props.transition);
    		if ('forceRemount' in $$props) $$invalidate(7, forceRemount = $$new_props.forceRemount);
    		if ('name' in $$props) $$invalidate(8, name = $$new_props.name);
    		if ('prevRouteId' in $$props) prevRouteId = $$new_props.prevRouteId;
    		if ('currentComponent' in $$props) $$invalidate(0, currentComponent = $$new_props.currentComponent);
    		if ('transitionClassName' in $$props) $$invalidate(1, transitionClassName = $$new_props.transitionClassName);
    		if ('firstRouteResolved' in $$props) $$invalidate(2, firstRouteResolved = $$new_props.firstRouteResolved);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentMatched*/ 512) {
    			pickRoute($currentMatched);
    		}
    	};

    	return [
    		currentComponent,
    		transitionClassName,
    		firstRouteResolved,
    		router,
    		currentMatched,
    		$$restProps,
    		transition,
    		forceRemount,
    		name,
    		$currentMatched
    	];
    }

    class RouterOutlet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { transition: 6, forceRemount: 7, name: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RouterOutlet",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get transition() {
    		throw new Error_1$2("<RouterOutlet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error_1$2("<RouterOutlet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get forceRemount() {
    		throw new Error_1$2("<RouterOutlet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set forceRemount(value) {
    		throw new Error_1$2("<RouterOutlet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error_1$2("<RouterOutlet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error_1$2("<RouterOutlet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@easyroute/svelte/lib/RouterLink.svelte generated by Svelte v3.43.1 */

    const { Error: Error_1$1 } = globals;
    const file$3 = "node_modules/@easyroute/svelte/lib/RouterLink.svelte";

    function create_fragment$8(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let a_levels = [{ href: /*to*/ ctx[0] }, /*attrs*/ ctx[1]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$3, 27, 0, 794);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*routerNavigate*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*to*/ 1) && { href: /*to*/ ctx[0] },
    				/*attrs*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RouterLink', slots, ['default']);
    	let { to } = $$props;
    	const context = getContext('easyrouteContext');
    	const router = context ? context.router : null;
    	const attrs = Object.assign({}, $$props);

    	if (!router) {
    		throw new Error('[Easyroute] RouterLink: no router instance found. Did you forget to wrap your ' + 'root component with <EasyrouteProvider>?');
    	}

    	function routerNavigate(evt) {
    		evt.preventDefault();
    		evt.stopPropagation();

    		if (!router) {
    			throw new Error('[Easyroute] Router instance not found in RouterLink');
    		}

    		router.push(to);
    	}

    	function sanitizeAttrs() {
    		delete attrs.to;
    		delete attrs.$$slots;
    		delete attrs.$$scope;
    	}

    	sanitizeAttrs();

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('to' in $$new_props) $$invalidate(0, to = $$new_props.to);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		to,
    		context,
    		router,
    		attrs,
    		routerNavigate,
    		sanitizeAttrs
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ('to' in $$props) $$invalidate(0, to = $$new_props.to);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [to, attrs, routerNavigate, $$scope, slots];
    }

    class RouterLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { to: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RouterLink",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*to*/ ctx[0] === undefined && !('to' in props)) {
    			console.warn("<RouterLink> was created without expected prop 'to'");
    		}
    	}

    	get to() {
    		throw new Error_1$1("<RouterLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error_1$1("<RouterLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@easyroute/svelte/lib/EasyrouteProvider.svelte generated by Svelte v3.43.1 */

    const { Error: Error_1 } = globals;

    function create_fragment$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EasyrouteProvider', slots, ['default']);
    	let { router = null } = $$props;

    	if (!router) {
    		throw new Error('[Easyroute] no router instance passed into EasyrouteProvider');
    	}

    	setContext('easyrouteContext', { depth: -1, router });
    	const writable_props = ['router'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EasyrouteProvider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('router' in $$props) $$invalidate(0, router = $$props.router);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ setContext, router });

    	$$self.$inject_state = $$props => {
    		if ('router' in $$props) $$invalidate(0, router = $$props.router);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [router, $$scope, slots];
    }

    class EasyrouteProvider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { router: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EasyrouteProvider",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get router() {
    		throw new Error_1("<EasyrouteProvider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set router(value) {
    		throw new Error_1("<EasyrouteProvider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    async function checkAsyncAndDownload(component) {
        const isAsync = /(\.then|import\(.+\)|vitePreload|_+import_+)/i.test(component.toString());
        if (!isAsync)
            return component;
        else {
            try {
                const newComponent = await component();
                return newComponent.default;
            }
            catch (e) {
                console.warn(`[Easyroute] caught an error while trying to download async component: "${e.message}"`);
                return component;
            }
        }
    }

    async function downloadDynamicComponents(matchedRoutes) {
        const nonDynamic = matchedRoutes.map(async (route) => {
            if (route.component) {
                route.component = await checkAsyncAndDownload(route.component);
            }
            if (route.components) {
                for await (const component of Object.entries(route.components)) {
                    const [key, value] = component;
                    route.components[key] = await checkAsyncAndDownload(value);
                }
            }
            return route;
        });
        return await Promise.all(nonDynamic);
    }

    function getRoutesTreeChain(allRoutes, currentRoute) {
        var _a;
        if (!currentRoute)
            return [];
        const tree = [currentRoute];
        let currentSeekingId = currentRoute.parentId;
        do {
            const seed = allRoutes.find((seedRoute) => seedRoute.id === currentSeekingId);
            seed && tree.push(seed);
            currentSeekingId = (_a = seed === null || seed === void 0 ? void 0 : seed.parentId) !== null && _a !== void 0 ? _a : null;
        } while (currentSeekingId);
        return tree;
    }
    function parseRoutes(routes, url) {
        const allMatched = [];
        const usedIds = [];
        const usedDepths = [];
        routes.forEach((route) => {
            if (route.regexpPath.test(url)) {
                allMatched.push(...getRoutesTreeChain(routes, route));
            }
        });
        return allMatched
            .filter((route) => {
            if (!usedIds.includes(route.id) &&
                !usedDepths.includes(route.nestingDepth)) {
                usedIds.push(route.id);
                usedDepths.push(route.nestingDepth);
                return true;
            }
            return false;
        })
            .sort((a, b) => b.nestingDepth - a.nestingDepth);
    }

    const deleteFirstSlash = (url) => url.replace(/^\//, '');

    const deleteLastSlash$1 = (url) => url.replace(/\/$/, '');

    const deleteEdgeSlashes = (url) =>
      deleteFirstSlash(deleteLastSlash$1(url));

    const generateId = () => Math.random().toString(36).substr(2, 9);

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    function getMatchData(arr, parentId = null, nestingDepth = 0, parentPath = '/') {
        return arr.reduce((acc, val) => {
            var _a;
            const componentPart = (val.component && { component: val.component }) ||
                (val.components && { components: val.components });
            const path = deleteEdgeSlashes(parentPath) + '/' + deleteEdgeSlashes(val.path);
            const { pattern, keys } = regexparam(path);
            const newRoute = {
                ...val,
                ...componentPart,
                parentId,
                nestingDepth,
                path,
                id: generateId(),
                regexpPath: pattern,
                pathKeys: keys
            };
            if (Array.isArray(val.children)) {
                acc = acc.concat(getMatchData(((_a = newRoute.children) !== null && _a !== void 0 ? _a : []), newRoute.id, nestingDepth + 1, newRoute.path));
            }
            return acc.concat(newRoute);
        }, []);
    }

    const deleteQueryTrailingSlash = (url) => url.replace(/(\/\?)/, '?');

    function constructUrl(url, base, omitTrailing = false) {
        omitTrailing &&
            url.split('?')[0].length > 1 &&
            (url = deleteQueryTrailingSlash(deleteLastSlash$1(url)));
        if (!base || url.includes(base))
            return url;
        return `/${deleteLastSlash$1(base)}/${deleteFirstSlash(url)}`;
    }

    function createObservable(initial) {
        const _listeners = {};
        let _value = initial;
        return {
            get getValue() {
                return _value;
            },
            subscribe(listener) {
                const id = generateId();
                _listeners[id] = listener;
                listener(_value);
                return () => delete _listeners[id];
            },
            set(v) {
                _value = v;
                Object.values(_listeners).forEach((l) => l(v));
            }
        };
    }

    function decode(str) {
        try {
            return decodeURIComponent(str);
        }
        catch (err) {
            console.warn(`[Easyroute] Could not decode query string: ${str}`);
        }
        return str;
    }
    function parseQuery(query) {
        const res = {};
        if (typeof query !== 'string')
            return res;
        query = query.trim().replace(/^(\?|#|&)/, '');
        if (!query) {
            return res;
        }
        query.split('&').forEach((param) => {
            const parts = param.replace(/\+/g, ' ').split('=');
            const key = decode(parts.shift());
            const val = parts.length > 0 ? decode(parts.join('=')) : null;
            if (res[key] === undefined) {
                res[key] = val;
            }
            else if (Array.isArray(res[key])) {
                val !== null && res[key].push(val);
            }
            else {
                if (val !== null) {
                    res[key] = [res[key], val];
                }
            }
        });
        return res;
    }

    function getPathParams(matchedRoute, url) {
        let pathValues = matchedRoute.regexpPath.exec(url);
        if (!pathValues)
            return {};
        pathValues = pathValues.slice(1, pathValues.length);
        const urlParams = {};
        for (let pathPart = 0; pathPart < pathValues.length; pathPart++) {
            const value = pathValues[pathPart];
            const key = matchedRoute.pathKeys[pathPart];
            urlParams[String(key)] = value;
        }
        return urlParams;
    }

    function createRouteObject(matchedRoutes, url) {
        var _a;
        const currentMatched = matchedRoutes.filter(Boolean)[0];
        if (!currentMatched)
            return {
                params: {},
                query: {},
                fullPath: ''
            };
        const [pathString, queryString] = url.split('?');
        return {
            params: getPathParams(currentMatched, pathString),
            query: parseQuery(queryString),
            name: currentMatched.name,
            fullPath: url,
            meta: (_a = currentMatched.meta) !== null && _a !== void 0 ? _a : {}
        };
    }

    /**
     * @description Is current environment - browser
     * @author flexdinesh/browser-or-node
     * @returns {boolean}
     */
    function isBrowser() {
      return (
        typeof window !== 'undefined' && typeof window.document !== 'undefined'
      );
    }

    const SSR$1 = !isBrowser();
    class Router {
        constructor(settings) {
            this.settings = settings;
            this.routes = [];
            this.ignoreEvents = false;
            this.currentUrl = '';
            this.beforeEachHooks = [];
            this.afterEachHooks = [];
            this.modeName = 'hash';
            this.transitionOutHooks = [];
            this.currentMatched = createObservable([]);
            this.currentRouteData = createObservable({
                params: {},
                query: {},
                name: '',
                fullPath: ''
            });
            this.currentRouteFromData = createObservable(null);
            this.silentControl = undefined;
            if (!settings.mode) {
                throw new ReferenceError('[Easyroute] Router mode is not defined: pass a function into "settings.mode"');
            }
            this.routes = getMatchData(settings.routes);
            settings.mode.call(this);
            if (SSR$1 && this.modeName !== 'history')
                throw new Error('[Easyroute] SSR only works with "history" router mode');
        }
        async parseRoute(url, doPushState = true) {
            url = url.replace(/^#/, '');
            const matched = parseRoutes(this.routes, url.split('?')[0]);
            if (!matched)
                return;
            const toRouteInfo = createRouteObject([matched[0]], url);
            const fromRouteInfo = createRouteObject([this.currentMatched.getValue[0]], this.currentUrl);
            const allowNext = await this.runHooksArray([
                ...this.beforeEachHooks,
                ...matched
                    .map((t) => t.beforeEnter)
                    .filter(Boolean)
            ], toRouteInfo, fromRouteInfo, 'before');
            if (!allowNext)
                return;
            // @ts-ignore
            this.changeUrl(constructUrl(url, this.base, this.settings.omitTrailingSlash), doPushState, toRouteInfo);
            this.currentRouteData.set(toRouteInfo);
            this.currentRouteFromData.set(fromRouteInfo);
            this.currentMatched.set(await downloadDynamicComponents(matched));
            this.runHooksArray(this.afterEachHooks, toRouteInfo, fromRouteInfo, 'after');
        }
        async executeHook(to, from, hook, type) {
            if (type === 'after')
                return hook(to, from);
            return new Promise(async (resolve) => {
                const next = (command) => {
                    if (command !== null && command !== undefined) {
                        if (command === false)
                            resolve(false);
                        if (typeof command === 'string') {
                            this.parseRoute(command);
                            resolve(false);
                        }
                    }
                    else {
                        resolve(true);
                    }
                };
                if (!hook)
                    resolve(true);
                else
                    await hook(to, from, next);
            });
        }
        async push(url) {
            this.ignoreEvents = true;
            await this.parseRoute(url);
        }
        back() {
            // @ts-ignore
            this.go(-1);
        }
        beforeEach(hook) {
            this.beforeEachHooks.push(hook);
        }
        afterEach(hook) {
            this.afterEachHooks.push(hook);
        }
        transitionOut(hook) {
            this.transitionOutHooks.push(hook);
        }
        async runHooksArray(hooks, to, from, type) {
            for await (const hook of hooks) {
                const allow = await this.executeHook(to, from, hook, type);
                if (!allow)
                    return false;
            }
            return true;
        }
        get base() {
            if (!this.settings.base)
                return '';
            return deleteEdgeSlashes(this.settings.base) + '/';
        }
        get currentRoute() {
            return this.currentRouteData.getValue;
        }
    }

    const stripBase = (url, base) =>
      Boolean(base) ? url.replace(base, '') : url;

    const deleteLastSlash = (url) => url.replace(/\/$/, '');

    const SSR = !isBrowser$1();

    function setHistoryMode() {
      this.modeName = 'history';
      this.changeUrl = function (url, doPushState = true) {
        doPushState &&
          !SSR &&
          window.history.pushState(
            {
              url
            },
            url,
            url
          );
      };
      this.go = function (howFar) {
        window.history.go(howFar);
      };
      if (SSR) return;
      Promise.resolve().then(() => {
        this.parseRoute(
          stripBase(
            `${deleteLastSlash(window.location.pathname)}/${
          window.location.search
        }`,
            this.base
          ),
          true
        );
      });
      window.addEventListener('popstate', (ev) => {
        ev.state
          ? this.parseRoute(stripBase(ev.state.url, this.base), false)
          : this.parseRoute('/', false);
      });
    }

    /* src/pages/Home.svelte generated by Svelte v3.43.1 */

    const file$2 = "src/pages/Home.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let a;
    	let t6;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Hello ");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			p = element("p");
    			t4 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t6 = text(" to learn how to build Svelte apps.");
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file$2, 5, 1, 46);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file$2, 6, 14, 83);
    			add_location(p, file$2, 6, 1, 70);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file$2, 4, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(main, t3);
    			append_dev(main, p);
    			append_dev(p, t4);
    			append_dev(p, a);
    			append_dev(p, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Home> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Display.svelte generated by Svelte v3.43.1 */

    function create_fragment$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("1");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Display', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Display> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Display extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Display",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pages/List.svelte generated by Svelte v3.43.1 */

    function create_fragment$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("All");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/Add.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/pages/Add.svelte";

    function create_fragment$3(ctx) {
    	let form;
    	let t0;
    	let input0;
    	let t1;
    	let br;
    	let t2;
    	let input1;
    	let t3;
    	let input2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			t0 = text("Name: ");
    			input0 = element("input");
    			t1 = space();
    			br = element("br");
    			t2 = text("\n    CNIC: ");
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			add_location(input0, file$1, 31, 10, 859);
    			add_location(br, file$1, 31, 62, 911);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "cnic");
    			add_location(input1, file$1, 32, 10, 928);
    			attr_dev(input2, "type", "submit");
    			add_location(input2, file$1, 34, 4, 987);
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "action", "/api/person/add");
    			add_location(form, file$1, 30, 0, 779);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, t0);
    			append_dev(form, input0);
    			set_input_value(input0, /*name*/ ctx[1]);
    			append_dev(form, t1);
    			append_dev(form, br);
    			append_dev(form, t2);
    			append_dev(form, input1);
    			set_input_value(input1, /*cnic*/ ctx[2]);
    			append_dev(form, t3);
    			append_dev(form, input2);
    			/*form_binding*/ ctx[5](form);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2 && input0.value !== /*name*/ ctx[1]) {
    				set_input_value(input0, /*name*/ ctx[1]);
    			}

    			if (dirty & /*cnic*/ 4 && to_number(input1.value) !== /*cnic*/ ctx[2]) {
    				set_input_value(input1, /*cnic*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*form_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Add', slots, []);
    	let formElement = null;
    	let name = "";
    	let cnic = "";

    	onMount(function () {
    		formElement.addEventListener("submit", function (e) {
    			e.preventDefault();
    			const formData = new FormData(formElement);
    			console.log(formData);

    			fetch(formElement.getAttribute("action"), {
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ name, cnic }),
    				method: "post"
    			}).then(res => {
    				return res.json();
    			}).then(json => {
    				console.log("json: ", json);
    			});
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Add> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	function input1_input_handler() {
    		cnic = to_number(this.value);
    		$$invalidate(2, cnic);
    	}

    	function form_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			formElement = $$value;
    			$$invalidate(0, formElement);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, formElement, name, cnic });

    	$$self.$inject_state = $$props => {
    		if ('formElement' in $$props) $$invalidate(0, formElement = $$props.formElement);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('cnic' in $$props) $$invalidate(2, cnic = $$props.cnic);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		formElement,
    		name,
    		cnic,
    		input0_input_handler,
    		input1_input_handler,
    		form_binding
    	];
    }

    class Add extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Add",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/NotFound.svelte generated by Svelte v3.43.1 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);

    	onMount(() => {
    		window.location = "https://www.google.com";
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount });
    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const router = new Router({
        mode: setHistoryMode,
        omitTrailingSlash: true,

        routes: [
            {
                path: '/',
                component: Home,
                name: 'Home'
            },
            {
                path: '/person',
                component: List,
                name: 'List'
            },
            {
                path: '/person/:id',
                component: Display,
                name: 'Display'
            },
            {
                path: '/add_person',
                component: Add,
                name: 'Add'
            },

            {
                path: '*',
                component: NotFound,
                name: 'Not Found'
            }
        ]
    });

    /* src/components/Navbar.svelte generated by Svelte v3.43.1 */
    const file = "src/components/Navbar.svelte";

    // (6:4) <RouterLink to={"/"}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(6:4) <RouterLink to={\\\"/\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (7:4) <RouterLink to={"/add_person"}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(7:4) <RouterLink to={\\\"/add_person\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (8:4) <RouterLink to={"/person"}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("All");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(8:4) <RouterLink to={\\\"/person\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let routerlink0;
    	let t0;
    	let routerlink1;
    	let t1;
    	let routerlink2;
    	let current;

    	routerlink0 = new RouterLink({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	routerlink1 = new RouterLink({
    			props: {
    				to: "/add_person",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	routerlink2 = new RouterLink({
    			props: {
    				to: "/person",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(routerlink0.$$.fragment);
    			t0 = text(" |\n    ");
    			create_component(routerlink1.$$.fragment);
    			t1 = text(" |\n    ");
    			create_component(routerlink2.$$.fragment);
    			add_location(div, file, 4, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(routerlink0, div, null);
    			append_dev(div, t0);
    			mount_component(routerlink1, div, null);
    			append_dev(div, t1);
    			mount_component(routerlink2, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const routerlink0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				routerlink0_changes.$$scope = { dirty, ctx };
    			}

    			routerlink0.$set(routerlink0_changes);
    			const routerlink1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				routerlink1_changes.$$scope = { dirty, ctx };
    			}

    			routerlink1.$set(routerlink1_changes);
    			const routerlink2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				routerlink2_changes.$$scope = { dirty, ctx };
    			}

    			routerlink2.$set(routerlink2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(routerlink0.$$.fragment, local);
    			transition_in(routerlink1.$$.fragment, local);
    			transition_in(routerlink2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(routerlink0.$$.fragment, local);
    			transition_out(routerlink1.$$.fragment, local);
    			transition_out(routerlink2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(routerlink0);
    			destroy_component(routerlink1);
    			destroy_component(routerlink2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ RouterLink });
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.1 */

    // (11:0) <EasyrouteProvider {router}>
    function create_default_slot(ctx) {
    	let navbar;
    	let t;
    	let routeroutlet;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	routeroutlet = new RouterOutlet({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(routeroutlet.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(routeroutlet, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(routeroutlet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(routeroutlet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(routeroutlet, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(11:0) <EasyrouteProvider {router}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let easyrouteprovider;
    	let current;

    	easyrouteprovider = new EasyrouteProvider({
    			props: {
    				router,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(easyrouteprovider.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(easyrouteprovider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const easyrouteprovider_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				easyrouteprovider_changes.$$scope = { dirty, ctx };
    			}

    			easyrouteprovider.$set(easyrouteprovider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(easyrouteprovider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(easyrouteprovider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(easyrouteprovider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		EasyrouteProvider,
    		router,
    		RouterOutlet,
    		RouterLink,
    		Navbar
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
