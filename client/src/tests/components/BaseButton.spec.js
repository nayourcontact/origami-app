import {mount} from '@vue/test-utils';
import BaseButton from '../../components/BaseButton.vue';
import {createRouter, createWebHistory} from 'vue-router';

let router;
beforeEach(async () => {
    router = createRouter({
        history: createWebHistory(),
        routes: [
            {path: '/', component: {template: '<div>Home</div>'}}, // mock útvonal
        ],
    });

    await router.push('/');
    await router.isReady(); // megvárjuk, hogy "elinduljon" a router
});

describe('BaseButton.vue', () => {
    it('renders with default text', () => {
        const wrapper = mount(BaseButton, {
            props: {
                tooltip: 'Click me',
            },
            slots: {
                default: 'Click me',
            },
            global: {
                plugins: [router],
            },
        });
        expect(wrapper.text()).toContain('Click me');
    });

    it('emits click when not disabled or loading', async () => {
        const wrapper = mount(BaseButton, {
            props: {
                tooltip: 'click-me',
            },
            global: {
                plugins: [router],
            },
        });

        await wrapper.find('button').trigger('click');
        expect(wrapper.emitted()).toHaveProperty('click');
    });

    it('does not emit click when disabled', async () => {
        const wrapper = mount(BaseButton, {
            props: {disabled: true, tooltip: 'disabled'},
            global: {
                plugins: [router],
            },
        });
        await wrapper.find('button').trigger('click');
        expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('shows loading spinner when loading is true', () => {
        const wrapper = mount(BaseButton, {
            props: {loading: true, tooltip: 'loading'},
            global: {
                plugins: [router],
            },
        });
        const spinner = wrapper.find('.fa-spinner');
        expect(spinner.exists()).toBe(true);
    });

    it('applies fullWidth class when prop is true', () => {
        const wrapper = mount(BaseButton, {
            props: {fullWidth: true, tooltip: 'full'},
            global: {
                plugins: [router],
            },
        });
        expect(wrapper.find('button').classes()).toContain('full-width');
    });

    it('renders custom icon via slot', () => {
        const wrapper = mount(BaseButton, {
            props: {tooltip: 'icon'},
            slots: {
                icon: '<svg class="custom-icon"></svg>',
            },
            global: {
                plugins: [router],
            },
        });
        expect(wrapper.find('.custom-icon').exists()).toBe(true);
    });
});
