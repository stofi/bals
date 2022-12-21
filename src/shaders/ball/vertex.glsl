/**
* THREE.js, vertex shader
*/
uniform float uTime;
uniform sampler2D uAlbedoMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform vec3 uColor;

uniform float uT_1;
uniform float uT_2;
uniform float uT_3;
uniform float uT_4;

uniform float uT_5;
uniform float uT_6;
uniform float uT_7;
uniform float uT_8;

// varying vec2 vUv;
varying vec3 vPos;

vec3 combineNormals(vec3 currentNormal, vec4 sampledNormal) {
  return normalize(currentNormal + 2.0 * (sampledNormal.xyz - vec3(0.5)));
}

void main() {

  // vec4 _normal = texture2D(uNormalMap, vUv);

  // csm_Normal = _normal.xyz;
  vUv = uv;
  vPos = position;

}
