uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float gSize;

#include ./includes/remap.glsl

void main()
{
    float progress = uProgress;
    vec3 newPosition = position;

    // Position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Size
    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= 1.0 / - viewPosition.z;
}