
# T-Shirt 3D Model Instructions

For the application to work correctly, you need to add a 3D model of a t-shirt in GLB format to this directory.

1. Save your t-shirt GLB file as "tshirt.glb" in this directory (public/).
2. The model should be a realistic t-shirt mesh (not made of primitive shapes).
3. The model should be properly centered and scaled.
4. For texture application to work correctly, the model should have proper UV mapping.
5. For designs/logos, it's helpful if the front face of the t-shirt has a named mesh such as "TShirtFront".

## Why am I seeing a simple box instead of a t-shirt?

If you're seeing a simple box shape instead of a realistic t-shirt, it means:
1. The tshirt.glb file is missing from the public directory
2. The file format is incorrect
3. There was an error loading the model

Please download a t-shirt GLB model and place it in the public directory with the name "tshirt.glb".

## Pattern Files

The application also uses pattern texture files that should be placed in a "patterns" subfolder:
- /patterns/stripes.png
- /patterns/polkadots.png
- /patterns/checkerboard.png

Make sure these files are available for the texture features to work correctly.
