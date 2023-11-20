<template>
	<main class="content rounded-normal">
		<slot></slot>
	</main>
</template>

<script>
export default {
	name: 'Content',
};
</script>

<style scoped>
.content {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	padding: 20px 20px;
	background-color: var(--bg-background);
}
</style>
