import { useState } from 'react';
import { Select, Checkbox, Radio, Switch } from 'antd';
import { AppButton } from '@shared/ui';
import { SendOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

export function UiKitPage() {
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState('a');
  const [toggled, setToggled] = useState(false);

  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'left' }}>
      <h1>UI Kit</h1>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <AppButton variant="primary">Primary</AppButton>
          <AppButton variant="secondary">Secondary</AppButton>
          <AppButton variant="tertiary">Tertiary</AppButton>
          <AppButton variant="primary" disabled>Disabled</AppButton>
          <AppButton variant="primary" loading>Loading</AppButton>
        </div>
      </section>

      <section>
        <h2>Form Controls</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3>Select</h3>
            <Select
              defaultValue="list"
              style={{ width: 200 }}
              options={[
                { value: 'list', label: 'List item 1' },
                { value: 'list2', label: 'List item 2' },
                { value: 'list3', label: 'List item 3' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3>Checkbox</h3>
            <Checkbox checked={checked} onChange={e => setChecked(e.target.checked)}>
              Option
            </Checkbox>
            <Checkbox checked={true}>Checked</Checkbox>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3>Radio</h3>
            <Radio.Group value={radio} onChange={e => setRadio(e.target.value)}>
              <Radio value="a">Option A</Radio>
              <Radio value="b">Option B</Radio>
            </Radio.Group>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3>Toggle</h3>
            <Switch checked={toggled} onChange={setToggled} />
            <Switch checked={true} />
          </div>

        </div>
      </section>

      <section>
        <h2>Icon Buttons</h2>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--triply-primary)', borderRadius: 8 }}>
            <SendOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }} />
            <BellOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }} />
            <UserOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
            <SendOutlined style={{ fontSize: 20, color: 'var(--triply-primary)', cursor: 'pointer' }} />
            <BellOutlined style={{ fontSize: 20, color: 'var(--triply-primary)', cursor: 'pointer' }} />
            <UserOutlined style={{ fontSize: 20, color: 'var(--triply-primary)', cursor: 'pointer' }} />
          </div>
        </div>
      </section>

      <section>
        <h2>Registration Button Variants</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ padding: 16, background: 'var(--triply-primary)', borderRadius: 8, display: 'flex', gap: 12 }}>
            <AppButton variant="tertiary">Registration</AppButton>
          </div>
          <div style={{ padding: 16, background: '#f0f0f0', borderRadius: 8, display: 'flex', gap: 12 }}>
            <AppButton variant="primary">Registration</AppButton>
          </div>
        </div>
      </section>

    </div>
  );
}
