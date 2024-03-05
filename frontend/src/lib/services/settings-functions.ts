import type { IKeys, IsDisabledButton, SetSettingsProps } from "$lib/types/global";

export const setSettingsProps: SetSettingsProps = ({ avatar, description }) => {
	return {
		avatar,
		username: '',
		description,
		password: { old: false, new: false, confirm: false },
		unblock: { users: [], groups: [] }
	}
};

export const isDisabledButton: IsDisabledButton = ({ avatar, description }) => {
	return {
		avatar: (value: string) => value !== avatar,
		username: (username: string) => username.length > 3  && username.length <= 40,
		description: (value: string) => value !== description,
		password: (password: IKeys<boolean>) => {
			return password.old && password.new && password.confirm;
		},
		unblock: (unblock: IKeys<string[]>) => {
			return unblock.users.length > 0 || unblock.groups.length > 0;
		},
		delete: () => true
	};
};
