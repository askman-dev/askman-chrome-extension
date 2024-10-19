import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import configStorage from '@src/shared/storages/configStorage';


interface ModelDropdownProps {
  displayName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
  onItemClick: (model: string) => void;
}


export default function ModelDropdown({ displayName, isOpen, setIsOpen, className, onItemClick }: ModelDropdownProps) {
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
    }
  }, [isOpen]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      const userModels = await configStorage.getModelConfig() || {};
      const modelArray = [];
      userModels.forEach(({ provider, config }) => {
        if (config.models) {
          config.models.forEach(m => {
            modelArray.push({
              name: provider + '/' + (m.name || m.id),
              config,
            });
          });
        }
      });
      setModels(modelArray);
      modelArray.length && onItemClick(modelArray[0].name);
    };

    fetchModels();
  }, []);

  return (
    <button
      className={classNames(`mr-2 ${className}`)}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={isOpen}
      type="button">
      <Menu as="div" className={classNames('relative inline-block text-left', className)}>
        <Menu.Button
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}>
          {displayName == 'free' ? 'Model' : displayName} ⌘ KKK
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
        </Menu.Button>

        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items
            static
            className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {models.map((model, index) => (
                <Menu.Item key={model.id}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
                      onClick={() => {
                        onItemClick(model.name);
                        setIsOpen(false);
                      }}>
                      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
                        {index}
                      </span>
                      {model.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </button>
  );
}
