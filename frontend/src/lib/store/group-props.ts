import type { IGroup, IGroupProps, Member } from "$lib/types/global";
import { writable } from "svelte/store";
import { addMember, banMember } from "$lib/services";

function setGroupProps(data: IGroupProps | null) {
	const { subscribe, set, update } = writable(data);

	return {
		subscribe,
		addMembers: (member: Member) => update(props => {
			if (props) props.add = addMember(member, props.add);

			return props;
		}),
		banMembers: (id: string) => update(props => {
			if (props) props.ban = banMember(id, props.ban);
			
			return props;
		}),
		blockMembers: (member: Member) => update(props => {
			if (props) props.block = addMember(member, props.block);
			
			return props;
		}),
		unblockMembers: (id: string) => update(props => {
			if (props) props.unblock = banMember(id, props.unblock);
			
			return props;
		}),
		addMods: (member: Member) => update(props => {
			if (props) props.addMod = addMember(member, props.addMod);
			
			return props;
		}),
		removeMods: (member: Member) => update(props => {
			if (props) props.removeMod = addMember(member, props.removeMod);
			
			return props;
		}),
		changeAvatar: (avatar: string | File) => update(props => {
			if (props) props.avatar = avatar;
			
			return props;
		}),
		changeDescription: function(this: HTMLInputElement) {
			return update(props => {
				if (props) props.description = this.value;
				
				return props;
			});
		},
		changeState: (state: string) => update(props => {
			if (props) props.state = state;
			
			return props;
		}),
		setProps: ({ avatar, description, state }: IGroup) => set({
			add: [],
			ban: [],
			block: [],
			unblock: [],
			addMod: [],
			removeMod: [],
			avatar,
			description,
			state,
			destroy: undefined
		}),
		resetProps: () => set(null)
	}
};

export const groupProps = setGroupProps(null);
